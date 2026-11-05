#!/usr/bin/env bash
# Compila o app e instala no celular Android conectado por USB.
#
#   scripts/install-android.sh            build de desenvolvimento (Metro + hot reload)
#   scripts/install-android.sh --release  APK release standalone, assinado
#
# Assinatura:
#   - debug:   o Gradle assina sozinho com android/app/debug.keystore.
#   - release: assina com a keystore informada (CB_KEYSTORE, CB_KEY_ALIAS,
#              CB_STORE_PASS, CB_KEY_PASS ou prompt; as CB_* podem ficar em
#              .env.local — veja .env.example). Sem keystore, usa a chave
#              de debug: instala e roda, mas NÃO serve para a Play Store.
set -Eeuo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
source scripts/lib.sh

# .env.local está no .gitignore; variáveis já exportadas no shell têm prioridade.
if [[ -f .env.local ]]; then
    set -a; source <(grep -E '^CB_[A-Z_]+=' .env.local | while IFS= read -r l; do k="${l%%=*}"; [[ -v $k ]] || echo "$l"; done); set +a
fi

MODE=debug
case "${1:-}" in
    "") ;;
    --release) MODE=release ;;
    -h|--help) sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) die "Opção desconhecida: $1 (use --release ou --help)" ;;
esac

need adb; need node
[[ -d node_modules ]] || { info "Instalando dependências..."; npm install; }

# ---- Dispositivo ----
if [[ -n "${ANDROID_SERIAL:-}" ]]; then
    SERIAL="$ANDROID_SERIAL"
else
    mapfile -t DEVICES < <(adb devices | awk 'NR>1 && $2=="device" {print $1}')
    adb devices | grep -q unauthorized \
        && warn "Há um aparelho 'unauthorized': desbloqueie-o e aceite a depuração USB."
    case ${#DEVICES[@]} in
        0) die "Nenhum celular autorizado. Ative a Depuração USB, conecte o cabo (com dados) e rode 'adb devices'." ;;
        1) SERIAL="${DEVICES[0]}" ;;
        *) echo "Vários dispositivos conectados:"
           select SERIAL in "${DEVICES[@]}"; do [[ -n "$SERIAL" ]] && break; done ;;
    esac
fi
MODEL="$(adb -s "$SERIAL" shell getprop ro.product.model | tr -d '\r')"
ABI="$(adb -s "$SERIAL" shell getprop ro.product.cpu.abi | tr -d '\r')"
success "Dispositivo: $MODEL ($SERIAL, $ABI)"

# Compila o código nativo só para a arquitetura do aparelho: build mais rápido e APK menor.
# O resultado só roda em aparelhos com esse ABI; para distribuir, use build-android-release*.sh.
export ORG_GRADLE_PROJECT_reactNativeArchitectures="$ABI"

# ---- Projeto nativo ----
[[ -d android ]] || { info "Gerando projeto nativo (expo prebuild)..."; npx expo prebuild --platform android; }

# Ao terminar (ou Ctrl+C), encerra os daemons que sobram em segundo plano.
stop_daemons() {
    info "Encerrando daemons do Gradle/Kotlin..."
    (cd android && ./gradlew --stop >/dev/null 2>&1) || true
    # shortcut: derruba o Kotlin daemon de qualquer projeto, não só deste; refinar se atrapalhar outros builds.
    pkill -f KotlinCompileDaemon 2>/dev/null || true
}
trap stop_daemons EXIT

if [[ "$MODE" == debug ]]; then
    info "Compilando e instalando build de desenvolvimento (assinada com a chave de debug)..."
    info "O Metro continua rodando; Ctrl+C para encerrar tudo."
    npx expo run:android --device "$SERIAL"
    exit
fi

# ---- Release: keystore ----
KS="${CB_KEYSTORE:-}"
[[ -n "$KS" ]] || read -r -p "Keystore (.jks) [Enter = chave de debug, só para teste local]: " KS
KS="${KS/#\~/$HOME}"

if [[ -z "$KS" ]]; then
    KS=android/app/debug.keystore; ALIAS=androiddebugkey; STORE_PASS=android; KEY_PASS=android
    warn "Assinando com a chave de DEBUG — não envie este APK para a Play Store."
else
    [[ -f "$KS" ]] || die "Keystore não encontrada: $KS"
    ALIAS="${CB_KEY_ALIAS:-}"
    [[ -n "$ALIAS" ]] || { read -r -p "Alias da chave [controlbit-upload]: " ALIAS; ALIAS="${ALIAS:-controlbit-upload}"; }
    STORE_PASS="${CB_STORE_PASS:-}"
    [[ -n "$STORE_PASS" ]] || { read -r -s -p "Senha da keystore: " STORE_PASS; echo; }
    KEY_PASS="${CB_KEY_PASS:-}"
    [[ -n "$KEY_PASS" ]] || { read -r -s -p "Senha da chave [Enter = igual à da keystore]: " KEY_PASS; echo; KEY_PASS="${KEY_PASS:-$STORE_PASS}"; }
fi
[[ -f "$KS" ]] || die "Keystore não encontrada: $KS (rode o prebuild de novo?)"
KS="$(realpath "$KS")"

# Valida antes de gastar minutos de build
CB_TMP_PASS="$STORE_PASS" keytool -list -keystore "$KS" -alias "$ALIAS" -storepass:env CB_TMP_PASS >/dev/null 2>&1 \
    || die "Não foi possível abrir a keystore (confira caminho, alias e senha)."

# Lidas pelo plugins/withAndroidReleaseSigning.js via Gradle; vivem só neste processo.
export ORG_GRADLE_PROJECT_MYAPP_UPLOAD_STORE_FILE="$KS"
export ORG_GRADLE_PROJECT_MYAPP_UPLOAD_KEY_ALIAS="$ALIAS"
export ORG_GRADLE_PROJECT_MYAPP_UPLOAD_STORE_PASSWORD="$STORE_PASS"
export ORG_GRADLE_PROJECT_MYAPP_UPLOAD_KEY_PASSWORD="$KEY_PASS"

# ---- Build ----
info "Compilando APK release (pode demorar)..."
(cd android && ./gradlew generateCodegenArtifactsFromSchema :app:assembleRelease)

APK="android/app/build/outputs/apk/release/app-release.apk"
[[ -f "$APK" ]] || die "APK não encontrado em $APK"

# Confirma a assinatura (apksigner vem nas build-tools do SDK)
SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}}"
APKSIGNER="$(ls "$SDK"/build-tools/*/apksigner 2>/dev/null | sort -V | tail -n1 || true)"
if [[ -n "$APKSIGNER" ]]; then
    "$APKSIGNER" verify --print-certs "$APK" | grep -E 'Signer #1 certificate SHA-1' \
        || die "APK sem assinatura válida."
    success "APK assinado."
else
    warn "apksigner não encontrado; assinatura não verificada (o adb recusa APK sem assinatura)."
fi

# ---- Instalação ----
PKG="$(node -p "require('./app.json').expo.android.package")"
if ! OUT="$(adb -s "$SERIAL" install -r "$APK" 2>&1)"; then
    echo "$OUT"
    grep -qE 'UPDATE_INCOMPATIBLE|signatures do not match' <<<"$OUT" || die "Falha na instalação."
    warn "Já existe uma versão com outra assinatura (ex.: build de debug)."
    read -r -p "Desinstalar a atual (apaga os dados do app) e reinstalar? [y/N]: " A
    [[ "$A" =~ ^[Yy]$ ]] || die "Instalação cancelada."
    adb -s "$SERIAL" uninstall "$PKG" >/dev/null
    adb -s "$SERIAL" install "$APK" >/dev/null
fi

adb -s "$SERIAL" shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 || true
success "Instalado e aberto em $MODEL: $PKG"
