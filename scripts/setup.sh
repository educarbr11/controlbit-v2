#!/usr/bin/env bash
# Valida o ambiente (Node, Java, Android SDK/ADB) e instala as dependências.
set -Eeuo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
source scripts/lib.sh

need node "Instale o Node.js 22+ (recomendado: nvm)."
need npm
need java "Instale o JDK 17."
need adb  "Instale o Android SDK Platform-Tools."

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
(( NODE_MAJOR >= 22 )) || die "Node $NODE_MAJOR detectado; é necessário 22+."

JAVA_MAJOR="$(java -version 2>&1 | awk -F'"' 'NR==1{split($2,v,"."); print v[1]}')"
[[ "$JAVA_MAJOR" == "17" ]] || warn "Java $JAVA_MAJOR detectado; o projeto usa JDK 17."

[[ -n "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}" ]] \
    || warn "ANDROID_HOME não definido (o Gradle pode não achar o SDK)."

success "Ambiente OK (node $(node -v), java $JAVA_MAJOR, $(adb version | head -n1))"

info "Instalando dependências..."
npm install

echo
success "Pronto. Próximos passos:"
echo "  npm run web              # roda no navegador"
echo "  npm run device           # compila e instala no celular via USB"
echo "  npm run device:release   # idem, versão release (APK assinado)"
