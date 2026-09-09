#!/usr/bin/env bash

set -Eeuo pipefail

# ============================================================
# ControlBit - Prebuild Android
#
# Gera (ou regenera) a pasta android/ nativa a partir do
# app.json/app.config, usando o Expo Prebuild.
# ============================================================

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
# Localizar raiz do projeto
# -----------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}   ControlBit - Prebuild Android${NC}"
echo -e "${CYAN}============================================${NC}"
echo


# -----------------------------
# Verificações iniciais
# -----------------------------

[[ -f "package.json" ]] \
    || die "package.json não encontrado. Execute este script na raiz do projeto."

command -v npx >/dev/null 2>&1 \
    || die "npx não encontrado. Instale o Node.js."

success "Estrutura do projeto encontrada."

echo


# -----------------------------
# Pasta android/ existente
# -----------------------------

CLEAN_FLAG=""

if [[ -d "android" ]]; then
    warning "A pasta android/ já existe."
    echo
    read -r -p "Deseja limpá-la e regenerar do zero? [y/N]: " CLEAN_ANSWER
    echo

    if [[ "$CLEAN_ANSWER" =~ ^[Yy]$ ]]; then
        CLEAN_FLAG="--clean"
        info "A pasta android/ será limpa antes do prebuild."
    else
        info "A pasta android/ será atualizada sem limpeza completa."
    fi
    echo
fi


# -----------------------------
# Prebuild
# -----------------------------

echo -e "${CYAN}--- Executando Expo Prebuild ---${NC}"
echo

info "Gerando projeto nativo Android..."
echo

# shellcheck disable=SC2086
npx expo prebuild --platform android $CLEAN_FLAG

echo

[[ -f "android/gradlew" ]] \
    || die "Prebuild terminou, mas android/gradlew não foi encontrado."

chmod +x android/gradlew


# -----------------------------
# Resultado
# -----------------------------

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}          PREBUILD CONCLUÍDO COM SUCESSO${NC}"
echo -e "${GREEN}============================================${NC}"
echo

success "Pasta android/ pronta em: $(realpath android)"
echo
echo "Próximo passo: ./build-android-release.sh para gerar o AAB de release."
echo
