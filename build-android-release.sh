#!/usr/bin/env bash

set -Eeuo pipefail

# ============================================================
# ControlBit - Build Android Release AAB
#
# O script:
#   1. Verifica dependências
#   2. Solicita a keystore e credenciais
#   3. Valida o SHA-1 da keystore
#   4. Injeta credenciais temporariamente no Gradle
#   5. Executa signingReport
#   6. Gera o AAB release
#   7. Confere o SHA-1 do AAB gerado
#   8. Remove as credenciais da sessão
# ============================================================


# -----------------------------
# Cores
# -----------------------------

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'


info() {
    echo -e "${BLUE}➜${NC} $1"
}

success() {
    echo -e "${GREEN}✔${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✖${NC} $1" >&2
}

die() {
    error "$1"
    exit 1
}


# -----------------------------
# Limpeza automática
# -----------------------------

cleanup() {
    unset ORG_GRADLE_PROJECT_MYAPP_UPLOAD_STORE_FILE || true
    unset ORG_GRADLE_PROJECT_MYAPP_UPLOAD_KEY_ALIAS || true
    unset ORG_GRADLE_PROJECT_MYAPP_UPLOAD_STORE_PASSWORD || true
    unset ORG_GRADLE_PROJECT_MYAPP_UPLOAD_KEY_PASSWORD || true

    unset CB_STORE_PASS || true
    unset STORE_PASSWORD || true
    unset KEY_PASSWORD || true
}

trap cleanup EXIT INT TERM


# -----------------------------
# Localizar raiz do projeto
# -----------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}   ControlBit - Android Release Builder${NC}"
echo -e "${CYAN}============================================${NC}"
echo


# -----------------------------
# Verificações iniciais
# -----------------------------

[[ -d "android" ]] || die "Pasta android/ não encontrada. Execute este script na raiz do projeto."

[[ -f "android/gradlew" ]] || die "android/gradlew não encontrado."

command -v java >/dev/null 2>&1 \
    || die "Java não está instalado ou não está no PATH."

command -v keytool >/dev/null 2>&1 \
    || die "keytool não encontrado. Verifique a instalação do JDK."

command -v realpath >/dev/null 2>&1 \
    || die "realpath não encontrado."

chmod +x android/gradlew

success "Estrutura do projeto encontrada."

echo
java -version 2>&1 | head -n 1
echo


# -----------------------------
# Keystore
# -----------------------------

echo -e "${CYAN}--- Configuração da chave de upload ---${NC}"
echo

read -r -p "Caminho da keystore (.jks): " KEYSTORE_INPUT

# Expande ~/ se necessário
KEYSTORE_INPUT="${KEYSTORE_INPUT/#\~/$HOME}"

[[ -f "$KEYSTORE_INPUT" ]] \
    || die "Keystore não encontrada: $KEYSTORE_INPUT"

KEYSTORE_PATH="$(realpath "$KEYSTORE_INPUT")"

read -r -p "Alias da chave [controlbit-upload]: " KEY_ALIAS
KEY_ALIAS="${KEY_ALIAS:-controlbit-upload}"

echo

read -r -s -p "Senha da keystore: " STORE_PASSWORD
echo

read -r -s -p "Senha da chave (Enter = mesma senha da keystore): " KEY_PASSWORD
echo

if [[ -z "$KEY_PASSWORD" ]]; then
    KEY_PASSWORD="$STORE_PASSWORD"
fi

[[ -n "$STORE_PASSWORD" ]] \
    || die "A senha da keystore não pode ser vazia."

echo


# -----------------------------
# Validar keystore
# -----------------------------

info "Validando a keystore..."

export CB_STORE_PASS="$STORE_PASSWORD"

KEYTOOL_OUTPUT="$(
    keytool -list -v \
        -keystore "$KEYSTORE_PATH" \
        -alias "$KEY_ALIAS" \
        -storepass:env CB_STORE_PASS \
        2>&1
)" || {
    error "Não foi possível abrir a keystore."
    echo
    echo "$KEYTOOL_OUTPUT"
    echo
    die "Verifique caminho, alias e senha."
}

KEYSTORE_SHA1="$(
    echo "$KEYTOOL_OUTPUT" |
    grep -m1 -E 'SHA1:' |
    sed -E 's/.*SHA1:[[:space:]]*//' |
    tr -d '[:space:]' |
    tr '[:lower:]' '[:upper:]'
)"

[[ -n "$KEYSTORE_SHA1" ]] \
    || die "Não foi possível identificar o SHA-1 da keystore."

success "Keystore válida."

echo
echo -e "Arquivo: ${GREEN}$KEYSTORE_PATH${NC}"
echo -e "Alias:   ${GREEN}$KEY_ALIAS${NC}"
echo -e "SHA-1:   ${GREEN}$KEYSTORE_SHA1${NC}"
echo


# -----------------------------
# Comparar SHA-1 esperado
# -----------------------------

echo -e "${CYAN}--- Validação com Google Play ---${NC}"
echo
echo "Informe o SHA-1 completo da CHAVE DE UPLOAD"
echo "mostrado no Google Play Console."
echo
echo "Você também pode pressionar Enter para pular esta validação."
echo

read -r -p "SHA-1 esperado: " EXPECTED_SHA1

EXPECTED_SHA1="$(
    echo "$EXPECTED_SHA1" |
    tr -d '[:space:]' |
    tr '[:lower:]' '[:upper:]'
)"

if [[ -n "$EXPECTED_SHA1" ]]; then

    if [[ "$KEYSTORE_SHA1" != "$EXPECTED_SHA1" ]]; then
        echo
        error "A keystore NÃO corresponde à chave esperada pelo Google Play."
        echo
        echo -e "Google espera: ${YELLOW}$EXPECTED_SHA1${NC}"
        echo -e "Keystore usa:  ${RED}$KEYSTORE_SHA1${NC}"
        echo
        die "Build cancelado para evitar gerar outro AAB com assinatura incorreta."
    fi

    success "SHA-1 corresponde à chave cadastrada no Google Play."
else
    warning "Comparação automática com Google Play ignorada."
fi

echo


# -----------------------------
# Credenciais temporárias Gradle
# -----------------------------

info "Configurando credenciais temporárias do Gradle..."

export ORG_GRADLE_PROJECT_MYAPP_UPLOAD_STORE_FILE="$KEYSTORE_PATH"
export ORG_GRADLE_PROJECT_MYAPP_UPLOAD_KEY_ALIAS="$KEY_ALIAS"
export ORG_GRADLE_PROJECT_MYAPP_UPLOAD_STORE_PASSWORD="$STORE_PASSWORD"
export ORG_GRADLE_PROJECT_MYAPP_UPLOAD_KEY_PASSWORD="$KEY_PASSWORD"

success "Credenciais carregadas apenas nesta sessão."

echo


# -----------------------------
# Entrar no Android
# -----------------------------

cd android


# -----------------------------
# Signing Report
# -----------------------------

echo -e "${CYAN}--- Signing Report ---${NC}"
echo

info "Verificando configuração de assinatura do release..."

SIGNING_REPORT="$(./gradlew :app:signingReport 2>&1)" || {
    echo "$SIGNING_REPORT"
    die "Gradle signingReport falhou."
}

# Mostra apenas a parte mais relevante
echo "$SIGNING_REPORT" |
awk '
    /Variant: release/ { show=1 }
    show { print }
    show && /^---$/ { exit }
'

echo

REPORT_SHA1="$(
    echo "$SIGNING_REPORT" |
    awk '
        /Variant: release/ { release=1; next }
        release && /SHA1:/ {
            sub(/.*SHA1:[[:space:]]*/, "")
            print
            exit
        }
        release && /^---$/ { exit }
    ' |
    tr -d '[:space:]' |
    tr '[:lower:]' '[:upper:]'
)"

if [[ -z "$REPORT_SHA1" ]]; then
    die "Não foi possível encontrar o SHA-1 da variante release no signingReport."
fi

if [[ "$REPORT_SHA1" != "$KEYSTORE_SHA1" ]]; then
    echo
    error "O Gradle está usando um certificado diferente da keystore informada."
    echo
    echo -e "Keystore: ${GREEN}$KEYSTORE_SHA1${NC}"
    echo -e "Gradle:   ${RED}$REPORT_SHA1${NC}"
    echo
    die "Build cancelado."
fi

success "Gradle release está usando a keystore correta."

echo


# -----------------------------
# Build
# -----------------------------

echo -e "${CYAN}--- Gerando Android App Bundle ---${NC}"
echo

# -----------------------------
# Limpeza segura
# -----------------------------

echo -e "${CYAN}--- Preparando build Android ---${NC}"
echo

info "Removendo artefatos antigos de build/CMake..."

rm -rf app/.cxx
rm -rf .cxx
rm -rf app/build
rm -rf build

success "Artefatos antigos removidos."

echo


# -----------------------------
# React Native Codegen
# -----------------------------

info "Gerando artefatos do React Native Codegen..."
echo

./gradlew generateCodegenArtifactsFromSchema

success "Codegen concluído."

echo


# -----------------------------
# Build
# -----------------------------

echo -e "${CYAN}--- Gerando Android App Bundle ---${NC}"
echo

info "Gerando bundleRelease..."
echo

./gradlew app:bundleRelease


# -----------------------------
# Localizar AAB
# -----------------------------

AAB_PATH="app/build/outputs/bundle/release/app-release.aab"

[[ -f "$AAB_PATH" ]] \
    || die "Build terminou, mas o arquivo $AAB_PATH não foi encontrado."

AAB_PATH="$(realpath "$AAB_PATH")"

echo
success "AAB gerado."
echo
echo -e "Arquivo:"
echo -e "${GREEN}$AAB_PATH${NC}"
echo


# -----------------------------
# Verificar certificado do AAB
# -----------------------------

echo -e "${CYAN}--- Verificação final do AAB ---${NC}"
echo

info "Lendo certificado do App Bundle..."

AAB_CERT="$(
    keytool -printcert \
        -jarfile "$AAB_PATH" \
        2>&1
)" || {
    echo "$AAB_CERT"
    die "Não foi possível verificar o certificado do AAB."
}

AAB_SHA1="$(
    echo "$AAB_CERT" |
    grep -m1 -E 'SHA1:' |
    sed -E 's/.*SHA1:[[:space:]]*//' |
    tr -d '[:space:]' |
    tr '[:lower:]' '[:upper:]'
)"

[[ -n "$AAB_SHA1" ]] \
    || die "Não foi possível extrair o SHA-1 do AAB."

echo
echo -e "SHA-1 da keystore: ${GREEN}$KEYSTORE_SHA1${NC}"
echo -e "SHA-1 do AAB:      ${GREEN}$AAB_SHA1${NC}"
echo

if [[ "$AAB_SHA1" != "$KEYSTORE_SHA1" ]]; then
    error "O AAB foi assinado com um certificado inesperado."
    die "Não envie este arquivo para a Play Store."
fi

if [[ -n "$EXPECTED_SHA1" && "$AAB_SHA1" != "$EXPECTED_SHA1" ]]; then
    error "O AAB não corresponde à chave esperada pelo Google Play."
    die "Não envie este arquivo para a Play Store."
fi


# -----------------------------
# Resultado
# -----------------------------

echo
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}          BUILD CONCLUÍDO COM SUCESSO${NC}"
echo -e "${GREEN}============================================${NC}"
echo

echo -e "AAB:"
echo -e "${GREEN}$AAB_PATH${NC}"
echo

echo -e "SHA-1:"
echo -e "${GREEN}$AAB_SHA1${NC}"
echo

success "Keystore → Gradle → AAB possuem a mesma assinatura."

if [[ -n "$EXPECTED_SHA1" ]]; then
    success "A assinatura também corresponde ao SHA-1 informado do Google Play."
fi

echo
echo "O arquivo acima está pronto para ser enviado ao Google Play Console."
echo