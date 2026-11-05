# Helpers compartilhados pelos scripts (use com: source scripts/lib.sh)
C_RED=$'\033[0;31m' C_GREEN=$'\033[0;32m' C_YELLOW=$'\033[1;33m' C_BLUE=$'\033[0;34m' C_OFF=$'\033[0m'

info()    { echo -e "${C_BLUE}➜${C_OFF} $*"; }
success() { echo -e "${C_GREEN}✔${C_OFF} $*"; }
warn()    { echo -e "${C_YELLOW}⚠${C_OFF} $*"; }
die()     { echo -e "${C_RED}✖${C_OFF} $*" >&2; exit 1; }
need()    { command -v "$1" >/dev/null 2>&1 || die "'$1' não encontrado. ${2:-Instale e tente de novo.}"; }
