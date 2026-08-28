# ControlBit v2

Aplicativo mobile para controle de projetos educacionais de robótica via Bluetooth, com suporte a controles básicos e personalizáveis.

O ControlBit v2 foi desenvolvido com **React Native + Expo** e permite comunicação com dispositivos físicos usando tanto **Bluetooth Low Energy (BLE)** quanto **Bluetooth Classic (SPP)**. O projeto é voltado principalmente para Android e para uso com módulos como **HM-10**, **HC-08**, **HC-05**, **HC-06** e dispositivos compatíveis com UART BLE, incluindo cenários com micro:bit.

> Este README é destinado principalmente a desenvolvedores internos do projeto.

---

## Sumário

- [Visão geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Stack tecnológica](#stack-tecnológica)
- [Arquitetura](#arquitetura)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Preparação do ambiente no Linux Mint](#preparação-do-ambiente-no-linux-mint)
- [Observações para outros sistemas operacionais](#observações-para-outros-sistemas-operacionais)
  - [Status dos ambientes](#status-dos-ambientes)
  - [Diagnóstico universal do Android SDK e ADB](#diagnóstico-universal-do-android-sdk-e-adb)
  - [Famílias Linux](#famílias-linux)
  - [Windows](#windows)
  - [macOS](#macos)
  - [Android Studio: instalação oficial x Flatpak/Snap](#android-studio-instalação-oficial-x-flatpaksnap)
- [Instalação do projeto](#instalação-do-projeto)
- [Executando em Android físico via USB](#executando-em-android-físico-via-usb)
- [Gerando APK, AAB e builds para iOS](#gerando-apk-aab-e-builds-para-ios)
- [Fluxo diário de desenvolvimento](#fluxo-diário-de-desenvolvimento)
- [Bluetooth](#bluetooth)
- [Comandos enviados aos dispositivos](#comandos-enviados-aos-dispositivos)
- [Controle básico](#controle-básico)
- [Controle customizável](#controle-customizável)
- [Persistência local](#persistência-local)
- [Internacionalização](#internacionalização)
- [Orientação de tela](#orientação-de-tela)
- [Scripts NPM](#scripts-npm)
- [Troubleshooting](#troubleshooting)
- [Alterações nativas e Prebuild](#alterações-nativas-e-prebuild)
- [Código legado ou experimental](#código-legado-ou-experimental)
- [Boas práticas para desenvolvimento](#boas-práticas-para-desenvolvimento)
- [Checklist antes de abrir um PR](#checklist-antes-de-abrir-um-pr)
- [Verificação rápida do ambiente](#verificação-rápida-do-ambiente)
- [Registro de ambientes validados](#registro-de-ambientes-validados)
- [Manutenção deste README](#manutenção-deste-readme)
- [Licença](#licença)

---

## Visão geral

O ControlBit é um aplicativo de controle para projetos de robótica educacional.

A aplicação oferece:

- controle direcional básico;
- envio de comandos de texto via Bluetooth;
- conexão com Bluetooth Classic e BLE;
- controles customizáveis;
- criação de perfis de controle;
- alteração de ícones, comandos, tamanhos e posições dos botões;
- persistência local das configurações;
- suporte a orientação retrato e paisagem;
- interface multilíngue;
- guia integrado para micro:bit.

A aplicação utiliza um contexto global de Bluetooth para centralizar scan, conexão, desconexão e envio de comandos.

---

## Funcionalidades

### Controle básico

O modo básico fornece uma interface pronta para comandos comuns de robótica, incluindo:

- frente;
- ré;
- esquerda;
- direita;
- buzina;
- parada;
- controle de servos;
- log visual de comandos;
- personalização dos comandos enviados.

Os valores padrão são:

```text
up
down
left
right
horn
stop
```

Esses valores podem ser alterados pelo usuário e ficam persistidos localmente.

### Controle customizável

O modo customizável permite:

- criar perfis de controle;
- usar perfis predefinidos;
- adicionar botões;
- editar nome do botão;
- selecionar ícone;
- definir comando;
- alterar tamanho;
- reposicionar botões;
- selecionar orientação retrato ou paisagem;
- executar o perfil no modo Play.

Perfis padrão atualmente incluídos:

- **Carro Padrão**
- **Braço Robótico**

### Bluetooth

O projeto suporta dois tipos de comunicação:

#### Bluetooth Classic

Principalmente para:

- HC-05
- HC-06

Comunicação via **SPP — Serial Port Profile**.

#### Bluetooth Low Energy

Principalmente para:

- HM-10
- HC-08
- dispositivos BLE UART;
- micro:bit ou outros dispositivos que exponham serviços UART compatíveis.

---

## Stack tecnológica

| Tecnologia | Uso |
|---|---|
| React | Interface |
| React Native | Aplicação mobile |
| Expo | Build, configuração e desenvolvimento |
| TypeScript | Tipagem |
| React Navigation | Navegação |
| NativeWind | Estilização baseada em Tailwind |
| Tailwind CSS | Tokens/utilitários de estilo |
| react-native-ble-plx | Bluetooth Low Energy |
| react-native-bluetooth-classic | Bluetooth Classic |
| AsyncStorage | Persistência local |
| react-native-reanimated | Animações |
| react-native-svg | SVG |
| Lucide React Native | Ícones |
| expo-screen-orientation | Controle de orientação |
| expo-font | Fontes locais |
| expo-splash-screen | Splash screen |

Versões principais atuais:

```text
Expo:         ~56.0.8
React Native: 0.85.3
React:        19.2.3
TypeScript:   ~6.0.3
```

---

## Arquitetura

Em alto nível:

```text
App.tsx
│
├── SafeAreaProvider
├── LanguageProvider
├── BluetoothProvider
└── Routes
    │
    ├── NavigationContainer
    │
    └── AppNavigator
        │
        ├── Bottom Tabs
        │   ├── Home
        │   ├── BasicControl
        │   └── CustomControl
        │
        └── Stack
            ├── Tabs
            ├── CustomControl
            └── CustomPlay
```

### Responsabilidades principais

#### `App.tsx`

Responsável por:

- carregar fontes;
- controlar splash screen;
- registrar providers globais;
- iniciar navegação.

#### `BluetoothContext.tsx`

Responsável por:

- permissões Bluetooth;
- monitoramento do adaptador;
- scan BLE;
- listagem de dispositivos Classic pareados;
- conexão BLE;
- conexão Classic;
- desconexão;
- envio de comandos.

#### `LanguageContext.tsx`

Responsável por:

- idioma atual;
- persistência do idioma;
- função `t()` de tradução.

#### `services/`

Responsável pela persistência de:

- comandos do controle básico;
- perfis de controle customizados;
- perfil ativo;
- orientação e botões customizados.

---

## Estrutura do projeto

```text
controlbit-v2/
│
├── assets/
│   ├── fonts/
│   └── imagens e ícones
│
├── patches/
│   └── patches aplicados via patch-package
│
├── src/
│   │
│   ├── components/
│   │   ├── icons/
│   │   ├── BasicCommandSettingsModal.tsx
│   │   ├── BluetoothButton.tsx
│   │   ├── BluetoothOffModal.tsx
│   │   ├── ControlPad.tsx
│   │   ├── DeviceListModal.tsx
│   │   ├── DottedBackground.tsx
│   │   ├── DraggableButton.tsx
│   │   ├── IconPickerModal.tsx
│   │   ├── LanguageDropdown.tsx
│   │   ├── MicrobitGuideModal.tsx
│   │   ├── NeoButton.tsx
│   │   ├── NeoCard.tsx
│   │   ├── ProfilePickerModal.tsx
│   │   ├── ScreenTransition.tsx
│   │   └── ServoSlider.tsx
│   │
│   ├── constants/
│   │   └── theme.ts
│   │
│   ├── context/
│   │   ├── ArduinoContext.tsx
│   │   ├── BluetoothContext.tsx
│   │   └── LanguageContext.tsx
│   │
│   ├── hooks/
│   │   └── useScreenOrientation.ts
│   │
│   ├── i18n/
│   │   └── translations.ts
│   │
│   ├── routes/
│   │   ├── index.tsx
│   │   └── routes.tsx
│   │
│   ├── screens/
│   │   ├── ArduinoControl/
│   │   ├── BasicControl/
│   │   ├── CustomControl/
│   │   ├── CustomPlay/
│   │   └── Home/
│   │
│   ├── services/
│   │   ├── basicCommandStorage.ts
│   │   └── storage.ts
│   │
│   ├── types/
│   │   ├── control.types.ts
│   │   ├── navigation.types.ts
│   │   └── root-param-list.ts
│   │
│   └── utils/
│       └── iconMap.tsx
│
├── App.tsx
├── app.json
├── build-android-release.sh
├── babel.config.js
├── global.css
├── index.ts
├── metro.config.js
├── nativewind-env.d.ts
├── package.json
├── package-lock.json
├── tailwind.config.js
└── tsconfig.json
```

---

# Pré-requisitos

O ambiente de referência do projeto é **Linux Mint**, mas o build Android também pode ser realizado localmente em **Windows**, **macOS** e outras distribuições Linux compatíveis com Android Studio.

Requisitos comuns:

```text
Node.js 22+
npm
JDK 17
Android Studio
Android SDK
ADB / Android SDK Platform-Tools
Git
Celular Android físico
Cabo USB com suporte a dados
```

Para manter o ambiente da equipe previsível, recomenda-se:

```text
Node.js 22 LTS
Java / JDK 17
Android SDK Platform 35
Android SDK Build-Tools 36.0.0
```

> Os comandos deste README usam **Linux Mint** como referência principal. Desenvolvedores em outros sistemas devem consultar a seção [Observações para outros sistemas operacionais](#observações-para-outros-sistemas-operacionais) antes de configurar Java, Android SDK e acesso USB.

---

# Preparação do ambiente no Linux Mint

## 1. Dependências básicas

```bash
sudo apt update

sudo apt install -y \
  git \
  curl \
  unzip \
  zip \
  build-essential \
  openjdk-17-jdk \
  android-sdk-platform-tools-common
```

Verifique:

```bash
git --version
java -version
javac -version
```

O Java deve apontar para a versão 17.

Exemplo:

```text
openjdk version "17..."
```

---

## 2. Configurar JAVA_HOME

Na maioria das instalações Linux Mint x86_64:

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

Para tornar permanente:

```bash
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc

source ~/.bashrc
```

Verifique:

```bash
echo $JAVA_HOME
java -version
```

Se o caminho do Java for diferente:

```bash
readlink -f "$(which java)"
```

---

## 3. Instalar Node.js com NVM

Evite depender da versão de Node disponível diretamente nos repositórios do sistema.

Instale o NVM conforme a documentação oficial do projeto e, depois:

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

Verifique:

```bash
node -v
npm -v
```

Esperado:

```text
Node v22.x
```

---

## 4. Instalar Android Studio

Instale o Android Studio oficial.

Após abrir o Android Studio:

```text
Settings
→ Languages & Frameworks
→ Android SDK
```

ou:

```text
More Actions
→ SDK Manager
```

Instale pelo menos:

```text
Android SDK Platform 35
Android SDK Build-Tools 36.0.0
Android SDK Platform-Tools
Android SDK Command-line Tools (latest)
```

Não é obrigatório criar um emulador quando o desenvolvimento será feito em celular físico.

---

## 5. Configurar ANDROID_HOME

O Android Studio normalmente instala o SDK em:

```text
~/Android/Sdk
```

Adicione ao `~/.bashrc`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

Recarregue:

```bash
source ~/.bashrc
```

Teste:

```bash
echo $ANDROID_HOME
adb version
```

---

## 6. Permissão USB / udev

Adicione o usuário ao grupo `plugdev`:

```bash
sudo usermod -aG plugdev $LOGNAME
```

Depois faça logout e login novamente.

Confirme:

```bash
id
```

O grupo `plugdev` deve aparecer.

O pacote instalado anteriormente:

```text
android-sdk-platform-tools-common
```

fornece regras `udev` para diversos dispositivos Android.

Caso necessário, recarregue:

```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
```

---

# Observações para outros sistemas operacionais

O **Linux Mint é o ambiente de referência e atualmente validado para o desenvolvimento do ControlBit**. As instruções para outros sistemas operacionais e distribuições Linux são orientações de compatibilidade para facilitar o onboarding de outros desenvolvedores.

> **Importante:** “compatível” não significa necessariamente “testado pela equipe”. Sempre registre no repositório quando uma nova combinação de sistema operacional, arquitetura e versão do Android SDK for efetivamente validada.

O fluxo da aplicação permanece praticamente o mesmo:

```text
Git clone
   ↓
npm ci
   ↓
npx expo-doctor
   ↓
ADB reconhece o aparelho
   ↓
npm run device
```

O que muda entre os ambientes é principalmente:

- instalação do JDK;
- localização do Android SDK;
- configuração de `JAVA_HOME`, `ANDROID_HOME` e `PATH`;
- disponibilidade e origem do `adb`;
- regras USB / `udev`;
- drivers USB no Windows;
- shell utilizado;
- arquitetura da máquina;
- disponibilidade de toolchains nativos para iOS.

---

## Status dos ambientes

Legenda:

```text
✅ Testado       → fluxo validado diretamente pela equipe/projeto
🟢 Compatível    → ambiente esperado para funcionar com o toolchain oficial
⚠️ Avançado      → exige configuração específica ou conhecimento adicional
❌ Não recomendado → aumenta significativamente a complexidade sem benefício para o projeto
```

| Ambiente | Status interno | Android local | Android físico USB | iOS local | Observação |
|---|---|---:|---:|---:|---|
| Linux Mint | ✅ Testado | Sim | Sim | Não | Ambiente principal deste README |
| Ubuntu | 🟢 Compatível | Sim | Sim | Não | Seguir Linux Mint / Debian-based |
| Debian | 🟢 Compatível | Sim | Sim | Não | Nomes/versões de pacotes podem variar |
| Pop!_OS / Zorin / elementary | 🟢 Compatível | Sim | Sim | Não | Seguir Ubuntu/Debian-based |
| Arch Linux | 🟢 Compatível | Sim | Sim | Não | `android-udev` e Java ativo merecem atenção |
| Manjaro / EndeavourOS / CachyOS / Garuda | 🟢 Compatível | Sim | Sim | Não | Seguir Arch-based |
| Fedora | 🟢 Compatível | Sim | Sim | Não | `dnf`; regras USB podem variar |
| RHEL / Rocky / Alma / CentOS Stream | 🟢 Compatível | Sim | Sim | Não | Seguir RHEL-based; repositórios podem variar |
| openSUSE Tumbleweed / Leap | 🟢 Compatível | Sim | Sim | Não | Preferir `adb` do Android SDK |
| Windows 10/11 64-bit | 🟢 Compatível | Sim | Sim | Não | Pode exigir driver USB OEM |
| macOS Intel | 🟢 Compatível | Sim | Sim | Sim | Xcode necessário para iOS |
| macOS Apple Silicon | 🟢 Compatível | Sim | Sim | Sim | Usar ferramentas ARM64 quando disponíveis |
| NixOS | ⚠️ Avançado | Sim | Sim | Não | Ambiente declarativo; não copiar comandos de outras distros |
| Gentoo / Void / outras | ⚠️ Avançado | Sim* | Sim* | Não | Validar Java, glibc, SDK, ADB e USB manualmente |
| WSL como ambiente Android completo | ⚠️ Avançado | Possível | Exige configuração extra | Não | Não é o padrão da equipe |
| Alpine Linux | ❌ Não recomendado | Não como fluxo padrão | Não como fluxo padrão | Não | Android Studio oficial pressupõe ambiente Linux com glibc |

`*` Compatibilidade depende do atendimento aos requisitos oficiais do Android Studio e do toolchain.

---

## Requisitos comuns a qualquer plataforma

Antes de investigar um erro específico da distribuição, confirme:

```text
Node 22.x
JDK 17
Android SDK configurado
Android SDK Platform exigida pelo projeto instalada
Android Build-Tools exigido pelo projeto instalado
Android SDK Platform-Tools instalado
adb funcional
celular listado como "device"
npm ci concluído
npx expo-doctor executado
```

No estado atual deste projeto, mantenha como referência:

```text
Node:                 22.x
Java/JDK:             17
Android SDK Platform: 35
Build-Tools:          36.0.0
```

---

## Diagnóstico universal do Android SDK e ADB

Uma fonte frequente de problemas é ter **mais de uma instalação de `adb`** na mesma máquina.

Exemplos:

```text
ADB instalado pelo sistema
        +
ADB instalado pelo Android Studio
        ↓
PATH aponta para uma versão diferente
        ↓
diagnóstico confuso / server version mismatch
```

O Android SDK Platform-Tools contém oficialmente `adb` e `fastboot`. Para desenvolvimento do ControlBit, prefira a cópia instalada pelo Android SDK/Android Studio.

### Linux / macOS

Verifique:

```bash
echo "$ANDROID_HOME"
command -v adb
adb version
```

Confirme também o binário do SDK:

```bash
ls -l "$ANDROID_HOME/platform-tools/adb"
"$ANDROID_HOME/platform-tools/adb" version
"$ANDROID_HOME/platform-tools/adb" devices
```

Para dar prioridade ao `adb` do Android SDK:

```bash
export PATH="$ANDROID_HOME/platform-tools:$PATH"
```

Depois:

```bash
hash -r 2>/dev/null || true

command -v adb
adb version
```

### Windows / PowerShell

Verifique:

```powershell
$env:ANDROID_HOME
Get-Command adb
adb version
adb devices
```

O executável normalmente esperado está em:

```text
%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe
```

Se houver outro `adb.exe` sendo encontrado antes dele no `Path`, ajuste a ordem das entradas.

---

## Arquitetura da máquina

Além do sistema operacional, registre a arquitetura utilizada pelo desenvolvedor.

As arquiteturas mais comuns são:

```text
x86_64 / AMD64
ARM64 / AArch64
Apple Silicon (ARM64)
```

Verifique no Linux/macOS:

```bash
uname -m
```

Resultados comuns:

```text
x86_64
aarch64
arm64
```

No Windows PowerShell:

```powershell
$env:PROCESSOR_ARCHITECTURE
```

### Linux ARM64

Antes de adotar Linux ARM64 como máquina principal da equipe, confirme a disponibilidade das ferramentas Android necessárias para a arquitetura utilizada.

Não assuma que um pacote ou binário x86_64 funcionará diretamente em ARM64.

### macOS Apple Silicon

Em Macs Apple Silicon, dê preferência a:

- Android Studio para ARM;
- JDK ARM64;
- Node ARM64;
- Homebrew ARM64;
- Command-line Tools correspondentes à arquitetura.

Evite misturar desnecessariamente binários Intel/Rosetta com ARM64.

---

## Famílias Linux

### Debian / Ubuntu-based

Esta é a família mais próxima do ambiente principal.

Exemplos:

```text
Linux Mint
Ubuntu
Debian
Pop!_OS
Zorin OS
elementary OS
Kubuntu
Xubuntu
Lubuntu
```

#### Linux Mint

Use o tutorial principal deste README em:

[Preparação do ambiente no Linux Mint](#preparação-do-ambiente-no-linux-mint)

#### Ubuntu e derivados

Na maioria dos casos, siga diretamente as instruções do Linux Mint.

Pacotes normalmente utilizados:

```bash
sudo apt update

sudo apt install -y \
  git \
  curl \
  unzip \
  zip \
  build-essential \
  openjdk-17-jdk \
  android-sdk-platform-tools-common
```

Depois configure:

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=$HOME/Android/Sdk
export PATH="$ANDROID_HOME/platform-tools:$PATH"
export PATH="$ANDROID_HOME/emulator:$PATH"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

> O valor de `JAVA_HOME` pode mudar de acordo com a arquitetura e a distribuição. Confirme com `readlink -f "$(command -v java)"`.

#### Debian

Debian segue a mesma lógica, mas versões e nomes de pacotes podem depender da release e dos repositórios habilitados.

O requisito funcional é:

```bash
node -v
npm -v
java -version
javac -version
adb version
adb devices
```

Não altere repositórios do sistema apenas para copiar literalmente o setup do Linux Mint. Prefira o Android Studio oficial para instalar o SDK e Platform-Tools.

---

### Arch Linux / Arch-based

Exemplos:

```text
Arch Linux
Manjaro
EndeavourOS
CachyOS
Garuda Linux
```

A instalação do Android Studio pode ser feita pelo pacote oficial distribuído pelo Android Developers. Isso reduz a dependência do projeto em um pacote AUR específico.

#### Dependências principais

No Arch Linux:

```bash
sudo pacman -Syu

sudo pacman -S --needed \
  git \
  curl \
  unzip \
  zip \
  base-devel \
  jdk17-openjdk \
  android-tools \
  android-udev
```

Para Node.js, mantenha preferencialmente a mesma estratégia com NVM:

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

#### Selecionar Java 17

Se houver mais de uma versão:

```bash
archlinux-java status
```

Quando necessário:

```bash
sudo archlinux-java set java-17-openjdk
```

Depois:

```bash
java -version
javac -version
```

#### ANDROID_HOME

Quando o SDK estiver em `~/Android/Sdk`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH="$ANDROID_HOME/platform-tools:$PATH"
export PATH="$ANDROID_HOME/emulator:$PATH"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

#### USB / udev

O pacote:

```text
android-udev
```

fornece regras para dispositivos Android.

Se necessário:

```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
```

Reconecte o celular:

```bash
adb kill-server
adb start-server
adb devices
```

> Não copie automaticamente a configuração `plugdev` do Ubuntu para Arch. Primeiro valide as regras fornecidas pelo `android-udev`.

---

### Fedora / RHEL / RHEL-based

Exemplos:

```text
Fedora
Red Hat Enterprise Linux
Rocky Linux
AlmaLinux
CentOS Stream
```

O procedimento de referência é:

1. instalar JDK 17 e ferramentas básicas via `dnf`;
2. instalar Android Studio;
3. instalar Android SDK e Platform-Tools pelo Android Studio;
4. configurar `ANDROID_HOME`;
5. validar ADB;
6. ajustar acesso USB apenas se necessário.

#### Dependências básicas

```bash
sudo dnf install -y \
  git \
  curl \
  unzip \
  zip \
  gcc \
  gcc-c++ \
  make \
  java-17-openjdk-devel
```

No Fedora, também pode existir:

```bash
sudo dnf install -y android-tools
```

Mesmo assim, para este projeto dê preferência ao `adb` do SDK quando houver diferença de versão:

```bash
"$ANDROID_HOME/platform-tools/adb" version
```

#### Java

```bash
java -version
javac -version
```

Descubra o caminho:

```bash
readlink -f "$(command -v javac)"
```

Se houver múltiplos JDKs, use o mecanismo de alternatives da distribuição para manter o Java 17 ativo.

#### ANDROID_HOME

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH="$ANDROID_HOME/platform-tools:$PATH"
export PATH="$ANDROID_HOME/emulator:$PATH"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

#### USB / udev

Não assuma que o grupo `plugdev` do Ubuntu existe.

Primeiro:

```bash
adb devices
```

Se houver problema:

```bash
lsusb

sudo udevadm control --reload-rules
sudo udevadm trigger

adb kill-server
adb start-server
adb devices
```

Consulte as regras e grupos recomendados pela própria distribuição caso o dispositivo só funcione com privilégios elevados.

> Não execute o desenvolvimento cotidiano com `sudo adb` ou `sudo npm`. Corrija as permissões do ambiente.

---

### openSUSE / SUSE-based

Exemplos:

```text
openSUSE Tumbleweed
openSUSE Leap
SUSE Linux Enterprise Desktop
```

#### Dependências básicas

Use `zypper` para as ferramentas disponíveis nos repositórios da instalação:

```bash
sudo zypper refresh

sudo zypper install \
  git \
  curl \
  unzip \
  zip
```

Localize um pacote JDK 17 disponível para a release utilizada:

```bash
zypper search -s openjdk | grep -E '17|java-17'
```

Instale o pacote de **desenvolvimento** correspondente ao OpenJDK 17 disponível nos repositórios da máquina e confirme:

```bash
java -version
javac -version
```

A disponibilidade de `android-tools` e de pacotes OpenJDK específicos pode variar conforme a versão/repositório do openSUSE.

**Não transforme esse pacote em requisito do projeto.**

A opção mais previsível é instalar o Android SDK pelo Android Studio e utilizar:

```bash
"$ANDROID_HOME/platform-tools/adb"
```

#### ANDROID_HOME

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH="$ANDROID_HOME/platform-tools:$PATH"
export PATH="$ANDROID_HOME/emulator:$PATH"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

#### Verificação

```bash
java -version
node -v
npm -v

"$ANDROID_HOME/platform-tools/adb" version
"$ANDROID_HOME/platform-tools/adb" devices
```

#### USB

Se o telefone não aparecer para o usuário normal:

```bash
lsusb
sudo udevadm control --reload-rules
sudo udevadm trigger
```

Consulte então as regras `udev` da versão do openSUSE em uso.

---

### NixOS

NixOS deve ser tratado como **ambiente avançado** neste projeto.

O sistema utiliza uma abordagem declarativa para pacotes e configuração. Por isso:

- não copie comandos `apt`, `dnf`, `pacman` ou `zypper`;
- prefira declarar Java/Node/ADB na configuração ou no ambiente de desenvolvimento;
- valide as regras de acesso USB conforme a versão do NixOS/systemd;
- tenha cuidado ao combinar um Android SDK instalado fora do Nix com ferramentas empacotadas pelo Nix.

O NixOS possui documentação própria para desenvolvimento Android e `adb`. Consulte essa documentação quando estiver preparando uma máquina NixOS.

#### O que precisa funcionar

Independentemente da maneira escolhida para declarar o ambiente:

```bash
node -v
npm -v
java -version
javac -version
adb version
adb devices
```

Depois:

```bash
npm ci
npx expo-doctor
npm run device
```

> Não adicione uma configuração Nix específica ao repositório como padrão da equipe sem validá-la em pelo menos uma máquina real.

---

### Gentoo, Void Linux e outras distribuições

Essas distribuições podem funcionar, mas são consideradas **ambientes avançados** até que sejam validadas pela equipe.

Em vez de documentar cada gerenciador de pacotes, garanta os requisitos:

```text
Node 22
npm
JDK 17
Git
Android Studio
Android SDK
Platform-Tools / adb
Command-line Tools
acesso USB ao telefone
```

O fluxo do ControlBit continua:

```bash
npm ci
npx expo-doctor
adb devices
npm run device
```

Se o Android Studio oficial não atender diretamente à distribuição, consulte primeiro os requisitos oficiais do Android Studio e a documentação da própria distro antes de criar workarounds no projeto.

---

### Alpine Linux

Alpine Linux **não é recomendado como workstation padrão para desenvolvimento Android deste projeto**.

O Android Studio oficial para Linux estabelece requisitos baseados em distribuições Linux 64-bit com **GNU C Library (`glibc`)**. Alpine utiliza **musl libc** por padrão.

Isso não significa que seja absolutamente impossível montar algum ambiente compatível, mas normalmente exige camadas adicionais de compatibilidade que não trazem benefício para o ControlBit.

Para desenvolvimento cotidiano, prefira:

```text
Linux Mint / Ubuntu
Arch-based
Fedora / RHEL-based
openSUSE
Windows
macOS
```

---

## Windows

No Windows, recomenda-se usar **PowerShell** ou o terminal integrado do editor com Node, Expo, Android SDK e ADB instalados diretamente no Windows.

Evite misturar, sem necessidade:

```text
Node dentro do WSL
+
Android Studio no Windows
+
ADB em outro ambiente
```

Essa combinação adiciona complexidade ao USB, filesystem e Metro.

### Node e Java

Mantenha:

```text
Node 22.x
JDK 17
```

Verifique:

```powershell
node -v
npm -v
java -version
```

### Android Studio e SDK

O caminho padrão normalmente é:

```text
%LOCALAPPDATA%\Android\Sdk
```

Defina:

```text
ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
```

No `Path`, dê prioridade para:

```text
%LOCALAPPDATA%\Android\Sdk\platform-tools
%LOCALAPPDATA%\Android\Sdk\emulator
%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest\bin
```

Abra um novo PowerShell:

```powershell
$env:ANDROID_HOME
Get-Command adb
adb version
adb devices
```

### USB / driver OEM

No Windows pode ser necessário instalar o **driver USB/ADB do fabricante do aparelho**.

Se o celular não aparecer:

1. confirme Depuração USB;
2. confirme cabo com dados;
3. aceite a chave RSA no telefone;
4. teste outra porta USB;
5. verifique Gerenciador de Dispositivos;
6. instale o driver OEM quando necessário;
7. reinicie o servidor ADB.

```powershell
adb kill-server
adb start-server
adb devices
```

### Executando o ControlBit

```powershell
npm ci
npx expo-doctor
npm run device
```

Se o projeto solicitar explicitamente o Expo:

```powershell
npm install expo
npm run device
```

### WSL

WSL não é o ambiente Android de referência deste repositório.

Use-o apenas se o desenvolvedor souber configurar conscientemente a comunicação entre WSL, Windows, USB e ADB.

Para onboarding e suporte interno, o padrão recomendado é:

```text
Node no Windows
Android Studio no Windows
Android SDK no Windows
ADB no Windows
```

---

## macOS

O macOS permite desenvolvimento Android e também é necessário quando houver necessidade de build nativo local para iOS.

### Arquitetura

Antes de instalar as ferramentas:

```bash
uname -m
```

Resultados comuns:

```text
x86_64 → Intel
arm64  → Apple Silicon
```

Baixe a variante adequada do Android Studio.

### Node e Java

Mantenha:

```text
Node 22.x
JDK 17
```

Para visualizar JDKs:

```bash
/usr/libexec/java_home -V
```

Para selecionar Java 17:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

Persistindo no Zsh:

```bash
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
source ~/.zshrc
```

### ANDROID_HOME

O Android Studio normalmente utiliza:

```text
$HOME/Library/Android/sdk
```

Configure:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH="$ANDROID_HOME/platform-tools:$PATH"
export PATH="$ANDROID_HOME/emulator:$PATH"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

Depois:

```bash
command -v adb
adb version
adb devices
```

### USB

O macOS normalmente não depende de driver USB OEM para o ADB.

Com Depuração USB habilitada:

```bash
adb devices
```

Aceite a autorização no telefone.

### Executando Android

```bash
npm ci
npx expo-doctor
npm run device
```

Se solicitado:

```bash
npm install expo
npm run device
```

### iOS

Build nativo local para iOS requer macOS e a toolchain Apple.

Quando o projeto passar a validar iOS, serão necessários, conforme o caso:

```text
Xcode
Xcode Command Line Tools
simulador/dispositivo iOS
assinatura/provisionamento
dependências nativas do projeto
```

O comando Expo correspondente é:

```bash
npx expo run:ios
```

> O suporte de uma biblioteca ou periférico Bluetooth no Android não garante suporte equivalente no iOS. O fluxo com HC-05/HC-06 deve ser validado separadamente antes de declarar suporte iOS.

---

## Android Studio: instalação oficial x Flatpak/Snap

Para reduzir diferenças entre máquinas da equipe, **prefira a distribuição oficial do Android Studio disponibilizada pelo Android Developers** ou uma instalação cujo SDK e permissões sejam claramente conhecidos.

Flatpak, Snap e outros formatos sandboxed podem funcionar, porém introduzem diferenças em:

- acesso ao filesystem;
- localização do Android SDK;
- acesso USB;
- integração com ferramentas externas;
- variáveis de ambiente.

Esses formatos não são proibidos, mas não são a referência para troubleshooting interno.

Quando um problema ocorrer em uma instalação sandboxed, valide primeiro:

```bash
echo "$ANDROID_HOME"
command -v adb
adb version
adb devices
```

---

## Diferenças de shell

Os exemplos Linux Mint usam principalmente Bash.

Para outros shells:

```text
Bash → ~/.bashrc ou ~/.bash_profile
Zsh  → ~/.zshrc ou ~/.zprofile
Fish → configuração própria; não copie literalmente a sintaxe `export`
```

Sempre valide:

```bash
echo "$JAVA_HOME"
echo "$ANDROID_HOME"
command -v node
command -v java
command -v adb
```

---

## Referências oficiais de ambiente

Para confirmar requisitos que podem mudar com novas versões das ferramentas, consulte:

- [Android Studio — instalação e requisitos](https://developer.android.com/studio/install)
- [Android SDK Platform-Tools — ADB e Fastboot](https://developer.android.com/tools/releases/platform-tools)
- [NixOS Wiki — Android](https://wiki.nixos.org/wiki/Android)
- [openSUSE Software — android-tools](https://software.opensuse.org/package/android-tools)

> Dependências do sistema operacional podem mudar ao longo do tempo. Quando houver conflito entre este README e a documentação oficial da ferramenta/distribuição, valide primeiro a documentação oficial e depois atualize este arquivo.

---

## Regra de compatibilidade da equipe

Antes de abrir uma issue de build, registre no ticket/PR:

```text
Sistema operacional:
Distribuição/versão:
Arquitetura:
Shell:
Node:
npm:
Java:
JAVA_HOME:
ANDROID_HOME:
adb:
Modelo do celular:
Versão do Android:
Resultado de adb devices:
Resultado relevante do expo-doctor:
```

Comandos Linux/macOS:

```bash
uname -a
uname -m
node -v
npm -v
java -version
echo "$JAVA_HOME"
echo "$ANDROID_HOME"
command -v adb
adb version
adb devices
npx expo-doctor
```

No Windows, substitua os comandos de identificação por equivalentes do PowerShell.

A finalidade é diferenciar rapidamente:

```text
problema do ambiente
        ≠
problema do Expo/Gradle
        ≠
problema do ControlBit
        ≠
problema do dispositivo Bluetooth
```

---

# Instalação do projeto

Clone o repositório:

```bash
mkdir -p ~/Projetos
cd ~/Projetos

git clone https://github.com/educarbr11/controlbit-v2.git

cd controlbit-v2
```

Instale as dependências:

```bash
npm ci
```

O projeto possui:

```json
"postinstall": "patch-package"
```

Portanto, não instale dependências com scripts desabilitados.

---

## Expo não encontrado após a instalação

`expo` já é uma dependência do projeto.

Entretanto, em alguns ambientes foi necessário executar explicitamente:

```bash
npm install expo
```

Se ao executar:

```bash
npm run device
```

o terminal solicitar a instalação do Expo, execute:

```bash
npm install expo
```

e repita:

```bash
npm run device
```

Depois da instalação, é recomendado validar o projeto:

```bash
npx expo-doctor
```

---

# Executando em Android físico via USB

## 1. Ativar modo desenvolvedor

No Android:

```text
Configurações
→ Sobre o telefone
→ Número da compilação
```

Toque repetidamente até habilitar as opções de desenvolvedor.

Depois:

```text
Configurações
→ Opções do desenvolvedor
→ Depuração USB
```

Ative a depuração USB.

---

## 2. Conectar o celular

Use um cabo USB que suporte transferência de dados.

Execute:

```bash
adb devices
```

Na primeira conexão pode aparecer:

```text
List of devices attached
XXXXXXXX    unauthorized
```

No celular, aceite:

```text
Permitir depuração USB deste computador?
```

Depois:

```bash
adb devices
```

O resultado esperado é:

```text
List of devices attached
XXXXXXXX    device
```

---

## 3. Build e instalação

Com o celular conectado:

```bash
npm run device
```

Esse script executa:

```bash
npx expo run:android --device
```

Na primeira execução, o Expo pode:

1. executar Prebuild;
2. gerar a pasta `android/`;
3. executar Gradle;
4. gerar um APK de desenvolvimento;
5. instalar o APK via ADB;
6. abrir o aplicativo no celular;
7. iniciar o Metro Bundler.

Um build bem-sucedido normalmente termina com:

```text
BUILD SUCCESSFUL
```

---

# Gerando APK, AAB e builds para iOS

Esta seção descreve como gerar **artefatos instaláveis ou distribuíveis** do ControlBit depois que o ambiente nativo estiver configurado.

O formato correto depende da plataforma e da finalidade:

| Plataforma | Formato | Uso principal | Instala diretamente no celular? |
|---|---|---|---:|
| Android | `.apk` | Teste manual, distribuição interna, sideload | Sim |
| Android | `.aab` | Google Play / publicação | Não |
| Android | `.apks` | Conjunto de APKs gerado a partir de AAB com `bundletool` | Via `bundletool` |
| iOS | `.app` | Bundle compilado, principalmente simulador/desenvolvimento | Depende da assinatura/destino |
| iOS | `.ipa` | Instalação/distribuição em dispositivos iOS | Sim, quando corretamente assinado/provisionado |
| iOS | `.xcarchive` | Arquivo intermediário criado pelo Xcode para distribuição | Não diretamente |

> **Regra prática:** para testar rapidamente em um Android físico, gere um **APK**. Para publicar na Google Play, gere um **AAB**. Para testar em um iPhone físico, use `npx expo run:ios --device` no macOS ou gere um **IPA assinado** via Xcode/EAS.

---

## Antes de gerar artefatos nativos

Os comandos Gradle abaixo exigem que a pasta:

```text
android/
```

já exista.

Ela normalmente é criada na primeira execução de:

```bash
npm run device
```

ou explicitamente por:

```bash
npx expo prebuild -p android
```

Para iOS, no macOS:

```bash
npx expo prebuild -p ios
```

Se houver mudanças em plugins Expo, permissões ou dependências nativas e for necessário reconstruir os projetos nativos do zero:

```bash
npx expo prebuild --clean
```

> `prebuild --clean` recria `android/` e `ios/`. Alterações manuais nesses diretórios podem ser perdidas.

---

# Android — gerar APK

## APK Debug

O APK Debug é apropriado para desenvolvimento e testes internos.

Linux/macOS:

```bash
cd android
./gradlew assembleDebug
```

Windows PowerShell:

```powershell
cd android
.\gradlew.bat assembleDebug
```

O arquivo normalmente será gerado em:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Se você já estiver dentro da pasta `android/`:

```text
app/build/outputs/apk/debug/app-debug.apk
```

### Instalar o APK Debug via ADB

A partir da raiz do projeto:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Ou dentro de `android/`:

```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

A opção:

```text
-r
```

solicita ao ADB a reinstalação/atualização do aplicativo preservando os dados quando a assinatura e o package forem compatíveis.

---

## APK Release

Para gerar um APK em modo Release, o fluxo citado e validado para o projeto é:

```bash
cd android
./gradlew assembleRelease
```

Também é possível usar explicitamente o módulo `app`:

```bash
cd android
./gradlew app:assembleRelease
```

No Windows PowerShell:

```powershell
cd android
.\gradlew.bat assembleRelease
```

O APK será normalmente criado em:

```text
android/app/build/outputs/apk/release/app-release.apk
```

A partir de `android/`:

```text
app/build/outputs/apk/release/app-release.apk
```

### Instalar o APK Release

A partir da raiz:

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

Ou dentro de `android/`:

```bash
adb install -r app/build/outputs/apk/release/app-release.apk
```

Esse é o formato recomendado quando a equipe precisa:

- enviar uma build Android manualmente para outro desenvolvedor;
- instalar o ControlBit sem Metro;
- testar comportamento próximo de Release;
- testar o aplicativo sem executar `npm start`;
- validar performance;
- realizar testes em vários aparelhos sem manter o computador conectado.

---

## Atenção: `assembleRelease` não significa automaticamente "pronto para produção"

Um build:

```bash
./gradlew assembleRelease
```

compila a variante Release, mas **a assinatura utilizada precisa ser validada antes de distribuir publicamente ou publicar o aplicativo**.

No ControlBit, a configuração nativa de Release utiliza uma `signingConfig` própria e lê as credenciais pelas propriedades:

```text
MYAPP_UPLOAD_STORE_FILE
MYAPP_UPLOAD_KEY_ALIAS
MYAPP_UPLOAD_STORE_PASSWORD
MYAPP_UPLOAD_KEY_PASSWORD
```

A variante `release` **não deve utilizar**:

```text
android/app/debug.keystore
```

O certificado de debug que já causou rejeição no Google Play tinha SHA-1 diferente da chave de upload cadastrada.

Antes de distribuir um APK Release, valide a assinatura com:

```bash
cd android
./gradlew :app:signingReport
```

Procure:

```text
Variant: release
Config: release
Store: /caminho/real/para/controlbit-upload.jks
Alias: controlbit-upload
SHA1: <SHA-1 DA CHAVE DE UPLOAD>
```

Para publicação na Google Play, prefira o fluxo automatizado descrito em [Android — assinatura de produção](#android--assinatura-de-produção), usando:

```bash
./build-android-release.sh
```

Nunca considere um APK ou AAB pronto para publicação apenas porque o Gradle retornou:

```text
BUILD SUCCESSFUL
```

A assinatura, o `applicationId` e o `versionCode` também precisam estar corretos.

Referências:

```text
https://docs.expo.dev/guides/local-app-production/
https://developer.android.com/studio/publish/app-signing
```

---

## Gerar APK a partir da raiz sem entrar em `android/`

Linux/macOS:

```bash
./android/gradlew -p android assembleRelease
```

Debug:

```bash
./android/gradlew -p android assembleDebug
```

Apesar disso, para documentação e troubleshooting, a equipe pode preferir o formato mais simples:

```bash
cd android
./gradlew assembleRelease
```

---

## Limpeza antes de builds Android

Não execute `./gradlew clean` automaticamente neste projeto antes de builds distribuíveis.

Com a New Architecture do React Native, módulos nativos com Codegen podem fazer o `clean` acionar `externalNativeBuildCleanRelease` sobre um estado antigo do CMake. Já foi observado no ControlBit um erro semelhante a:

```text
Task :app:externalNativeBuildCleanRelease FAILED

add_subdirectory given source
".../generated/source/codegen/jni/"
which is not an existing directory
```

Quando for necessário descartar artefatos nativos antigos, a limpeza interna adotada pelo script de Release é:

```bash
cd android

rm -rf app/.cxx
rm -rf .cxx
rm -rf app/build
rm -rf build
```

Depois, gere explicitamente os artefatos de Codegen:

```bash
./gradlew generateCodegenArtifactsFromSchema
```

e só então execute o build desejado:

```bash
./gradlew app:assembleRelease
```

ou, para publicação:

```bash
./gradlew app:bundleRelease
```

O script:

```text
build-android-release.sh
```

automatiza esse fluxo para o AAB de produção.

---

# Android — gerar AAB

O **Android App Bundle (`.aab`)** é o formato recomendado para publicação na Google Play.

Um AAB contém código e recursos compilados, mas a Google Play gera APKs otimizados para cada dispositivo a partir dele.

Por isso:

> **Um `.aab` não é normalmente instalado diretamente com `adb install`.**

Para gerar:

Linux/macOS:

```bash
cd android
./gradlew bundleRelease
```

Forma explícita:

```bash
cd android
./gradlew app:bundleRelease
```

Windows PowerShell:

```powershell
cd android
.\gradlew.bat bundleRelease
```

O arquivo normalmente será criado em:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

A partir da pasta `android/`:

```text
app/build/outputs/bundle/release/app-release.aab
```

O Expo documenta oficialmente o comando:

```bash
cd android
./gradlew app:bundleRelease
```

para gerar um AAB local.

Referências:

```text
https://docs.expo.dev/guides/local-app-production/
https://developer.android.com/guide/app-bundle
```

---

## APK x AAB

Use:

```text
APK
```

quando o objetivo for:

- testar diretamente no celular;
- enviar o arquivo para um pequeno grupo interno;
- instalar manualmente;
- validar uma Release local.

Use:

```text
AAB
```

quando o objetivo for:

- Google Play Console;
- Internal Testing da Play Store;
- Closed Testing;
- Open Testing;
- produção na Google Play.

Fluxo:

```text
APK
 └── adb install / instalação manual

AAB
 └── Google Play
       └── gera APKs otimizados para os aparelhos
```

---

## Testar um AAB

Como um AAB não é um APK instalável diretamente, existem duas estratégias principais.

### Opção 1 — Google Play Internal Testing

Para validar exatamente o fluxo de distribuição da Play Store:

```text
bundleRelease
      ↓
app-release.aab
      ↓
Google Play Console
      ↓
Internal Testing
      ↓
Google Play instala no aparelho
```

Esse é o caminho recomendado quando a intenção é validar uma versão próxima da publicação.

### Opção 2 — bundletool

O Android fornece a ferramenta oficial:

```text
bundletool
```

que pode transformar um AAB em um conjunto de APKs (`.apks`) e instalar os APKs apropriados no dispositivo.

Documentação:

```text
https://developer.android.com/tools/bundletool
```

Para testes cotidianos do ControlBit, entretanto, é mais simples gerar diretamente:

```bash
./gradlew assembleRelease
```

e instalar o APK resultante.

---

# Android — assinatura de produção

A publicação Android do ControlBit utiliza **Google Play App Signing** com uma **chave de upload** privada da equipe.

Existem duas chaves conceitualmente diferentes:

```text
Chave de upload
      ↓
usada pela equipe para assinar o AAB enviado
      ↓
Google Play valida o certificado do upload

Chave de assinatura do app
      ↓
mantida/gerenciada pelo Google Play App Signing
      ↓
usada na assinatura entregue aos usuários
```

Para builds locais, o EAS **não participa da assinatura**. O AAB é assinado pelo Gradle na máquina que executa o build.

O identificador Android usado para atualizar o aplicativo já existente no Google Play deve continuar sendo:

```text
com.dejesusdev.controlbit
```

Alterar o `applicationId` para outro valor, por exemplo:

```text
com.dogomaker.controlbit
```

faz o bundle representar outro aplicativo e impede o upload como atualização do cadastro existente.

---

## Configuração nativa de Release

O arquivo:

```text
android/app/build.gradle
```

deve manter uma configuração equivalente a:

```gradle
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }

    release {
        if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }
    }
}

buildTypes {
    debug {
        signingConfig signingConfigs.debug
    }

    release {
        signingConfig signingConfigs.release

        // Demais configurações de Release...
    }
}
```

A regra importante é:

```gradle
release {
    signingConfig signingConfigs.release
}
```

Nunca use em produção:

```gradle
release {
    signingConfig signingConfigs.debug
}
```

---

## Não deixe placeholders de certificado no `gradle.properties`

O arquivo versionado:

```text
android/gradle.properties
```

não deve conter valores fictícios como:

```properties
MYAPP_UPLOAD_STORE_FILE=/caminho/para/sua/upload-keystore.jks
MYAPP_UPLOAD_KEY_ALIAS=seu-alias
MYAPP_UPLOAD_STORE_PASSWORD=sua-senha
MYAPP_UPLOAD_KEY_PASSWORD=sua-senha
```

Esses placeholders já causaram um build tentar abrir literalmente:

```text
/caminho/para/sua/upload-keystore.jks
```

e falhar em:

```text
:app:validateSigningRelease
```

As credenciais de Release são fornecidas temporariamente pelo script de build através das propriedades Gradle expostas como variáveis:

```text
ORG_GRADLE_PROJECT_MYAPP_UPLOAD_STORE_FILE
ORG_GRADLE_PROJECT_MYAPP_UPLOAD_KEY_ALIAS
ORG_GRADLE_PROJECT_MYAPP_UPLOAD_STORE_PASSWORD
ORG_GRADLE_PROJECT_MYAPP_UPLOAD_KEY_PASSWORD
```

As senhas não devem ser commitadas.

---

## Arquivo da chave de upload

A chave privada deve permanecer fora do repositório.

Exemplo:

```text
~/keys/controlbit/controlbit-upload.jks
```

ou:

```text
~/Documentos/keys/controlbit/controlbit-upload.jks
```

Nunca faça commit de:

```text
*.jks
*.keystore
*.p12
*.pem privado
senhas
credentials.json
```

O certificado público `.pem`, quando necessário para um reset da Upload Key, não contém a chave privada, mas ainda assim deve ser tratado como artefato operacional e não precisa ficar no repositório do aplicativo.

---

## Validar uma keystore antes do build

Para consultar o certificado:

```bash
keytool -list -v \
  -keystore /caminho/para/controlbit-upload.jks \
  -alias controlbit-upload
```

Procure:

```text
SHA1: XX:XX:XX:...
```

Esse SHA-1 deve corresponder ao certificado da **chave de upload** aceito no Google Play Console.

Não confunda com a chave de debug:

```text
android/app/debug.keystore
```

nem com o certificado da chave de assinatura do app exibido separadamente pelo Play App Signing.

---

## Gerar ou redefinir uma Upload Key

Se a chave de upload original for perdida e o aplicativo estiver no Play App Signing, uma nova chave de upload pode ser criada e o certificado público pode ser enviado em uma solicitação de redefinição da Upload Key no Google Play Console.

Exemplo de criação:

```bash
keytool -genkeypair -v \
  -keystore controlbit-upload.jks \
  -alias controlbit-upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Exporte somente o certificado público:

```bash
keytool -export -rfc \
  -keystore controlbit-upload.jks \
  -alias controlbit-upload \
  -file upload_certificate.pem
```

Arquivos:

```text
controlbit-upload.jks
        ↓
CHAVE PRIVADA
        ↓
fica protegida com a equipe

upload_certificate.pem
        ↓
CERTIFICADO PÚBLICO
        ↓
pode ser enviado ao Google durante o reset
```

Depois que o Google aceitar a nova Upload Key, todos os AABs seguintes precisam ser assinados com a chave privada correspondente ao novo certificado cadastrado.

Referência:

```text
https://developer.android.com/studio/publish/app-signing
```

---

## Script oficial interno para gerar o AAB

O projeto utiliza:

```text
build-android-release.sh
```

na raiz do repositório para automatizar o build Android de produção.

Ele deve:

1. validar Java, `keytool`, Gradle Wrapper e estrutura do projeto;
2. solicitar o caminho da keystore;
3. solicitar alias e senhas sem exibi-las no terminal;
4. extrair o SHA-1 da keystore;
5. solicitar o SHA-1 esperado da chave de upload do Google Play;
6. cancelar o build se os certificados forem diferentes;
7. fornecer as credenciais ao Gradle apenas durante o processo;
8. executar `:app:signingReport`;
9. confirmar que a variante `release` usa a keystore esperada;
10. remover caches nativos antigos sem depender de `./gradlew clean`;
11. executar `generateCodegenArtifactsFromSchema`;
12. gerar `app:bundleRelease`;
13. ler o certificado do AAB final;
14. confirmar que Keystore → Gradle → AAB usam o mesmo SHA-1;
15. limpar as variáveis sensíveis ao encerrar.

Antes do primeiro uso:

```bash
chmod +x build-android-release.sh
```

Para gerar o AAB:

```bash
./build-android-release.sh
```

Não execute diretamente:

```bash
cd android
./gradlew app:bundleRelease
```

para o fluxo normal de publicação, pois isso ignora as validações adicionais do script e exige que as propriedades de assinatura já estejam configuradas manualmente na sessão.

---

## Build em outra máquina

A compilação pode ser realizada em outro computador da equipe quando a máquina principal não tiver recursos suficientes.

A máquina de build precisa ter:

```text
código atualizado
dependências instaladas
JDK configurado
Android SDK configurado
keystore de upload
script build-android-release.sh
```

Fluxo:

```text
git clone / git pull
        ↓
npm ci
        ↓
receber a keystore por canal seguro
        ↓
./build-android-release.sh
        ↓
validar SHA-1
        ↓
gerar app-release.aab
        ↓
copiar somente o AAB necessário
```

Se a máquina não for uma estação oficial de releases, remova a cópia da keystore e qualquer credencial operacional depois que o artefato tiver sido validado.

Não envie a chave privada por commit, issue, chat público ou outro canal sem proteção adequada.

---

## Saída esperada

Quando o processo terminar corretamente:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

Antes do upload, o script deve confirmar conceitualmente:

```text
Keystore
   │
   └── SHA-1 correto

Gradle release
   │
   └── SHA-1 correto

app-release.aab
   │
   └── SHA-1 correto

Google Play — Upload Key
   │
   └── mesmo certificado
```

O certificado do AAB também pode ser verificado manualmente:

```bash
keytool -printcert \
  -jarfile android/app/build/outputs/bundle/release/app-release.aab
```

---

## Versionamento obrigatório para Google Play

Cada upload deve utilizar um `versionCode` **maior que qualquer valor já enviado anteriormente**.

Exemplo no:

```text
android/app/build.gradle
```

```gradle
defaultConfig {
    applicationId 'com.dejesusdev.controlbit'
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion

    versionCode 2
    versionName "1.0.1"
}
```

Conceitualmente:

```text
versionCode 1 → já enviado
versionCode 2 → próxima versão
versionCode 3 → versão seguinte
...
```

O Google Play não permite reutilizar um `versionCode`.

O `versionName` é a versão legível para o usuário; o `versionCode` é o inteiro interno de atualização.

Como o projeto usa Expo Prebuild, mantenha também as configurações equivalentes no `app.json` quando aplicável, para que uma regeneração dos arquivos nativos não reverta o package/versionamento.

---

## Fluxo de publicação validado

```text
applicationId
com.dejesusdev.controlbit
        │
        ▼
incrementar versionCode
        │
        ▼
keystore privada de upload
        │
        ▼
./build-android-release.sh
        │
        ├── valida SHA-1 da keystore
        ├── valida signingReport
        ├── prepara Codegen/CMake
        ├── gera bundleRelease
        └── valida SHA-1 do AAB
        │
        ▼
app-release.aab
        │
        ▼
Google Play Console
```

Referências:

```text
https://docs.expo.dev/guides/local-app-production/
https://developer.android.com/studio/publish/app-signing
https://developer.android.com/studio/publish/versioning
```

---

## Erro de assinatura ao instalar um novo APK

Quando uma versão já instalada do ControlBit foi assinada com uma chave diferente, pode ocorrer algo parecido com:

```text
INSTALL_FAILED_UPDATE_INCOMPATIBLE
```

Isso pode acontecer, por exemplo, ao mudar de:

```text
debug.keystore
```

para:

```text
keystore de produção
```

Como ambas as versões utilizam:

```text
com.dejesusdev.controlbit
```

o Android não permite substituir um aplicativo por outro com assinatura incompatível.

Para ambiente de teste:

```bash
adb uninstall com.dejesusdev.controlbit
```

Depois:

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

> `adb uninstall` remove também os dados locais da aplicação. Faça isso apenas quando aceitável.

---

# Android — comandos rápidos

### Debug APK

Linux/macOS:

```bash
cd android
./gradlew assembleDebug
```

Saída:

```text
app/build/outputs/apk/debug/app-debug.apk
```

### Release APK

Quando as credenciais de Release estiverem carregadas:

```bash
cd android
./gradlew app:assembleRelease
```

Saída:

```text
app/build/outputs/apk/release/app-release.apk
```

Antes de distribuir, confirme a variante `release` com:

```bash
./gradlew :app:signingReport
```

### Release AAB para Google Play

Fluxo recomendado:

```bash
./build-android-release.sh
```

Saída:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

O script valida a Upload Key antes e depois da compilação.

### Instalar Release APK

```bash
adb install -r app/build/outputs/apk/release/app-release.apk
```

### Limpeza nativa segura

Quando houver inconsistência de CMake/Codegen:

```bash
cd android

rm -rf app/.cxx
rm -rf .cxx
rm -rf app/build
rm -rf build

./gradlew generateCodegenArtifactsFromSchema
```

Evite usar `./gradlew clean` como passo automático do fluxo de Release.

---

# iOS — conceitos importantes

O iOS utiliza uma cadeia de build e distribuição diferente do Android.

Não existem equivalentes diretos a:

```text
APK
AAB
```

Os formatos mais importantes são:

### `.app`

Bundle compilado de uma aplicação Apple.

Pode representar, por exemplo:

- build de simulador;
- build de desenvolvimento;
- build resultante do Xcode.

Um `.app` criado para o **iOS Simulator não pode ser instalado em um iPhone físico**.

### `.ipa`

Pacote utilizado para distribuir uma aplicação iOS para dispositivos reais.

Para funcionar em um iPhone, o IPA deve estar:

- assinado;
- associado a certificados Apple válidos;
- associado ao provisioning adequado à forma de distribuição.

### `.xcarchive`

Arquivo produzido pelo processo de Archive do Xcode.

Ele é utilizado para posteriormente:

- exportar um IPA;
- enviar ao TestFlight;
- enviar à App Store;
- gerar builds de distribuição.

Fluxo típico:

```text
código
  ↓
Xcode
  ↓
.xcarchive
  ↓
Distribute App
  ├── Development / dispositivo registrado
  ├── Ad Hoc / distribuição interna
  ├── TestFlight
  └── App Store
       ↓
      .ipa / App Store Connect
```

---

# iOS — requisitos

## Build local

Para gerar e assinar builds iOS localmente é necessário:

```text
macOS
Xcode
Xcode Command Line Tools
projeto ios/ gerado
configuração de Signing & Capabilities
```

O comando:

```bash
npx expo run:ios
```

só pode ser executado localmente em um Mac com Xcode instalado.

Linux e Windows **não conseguem executar a toolchain Xcode localmente**.

Nesses ambientes, a alternativa para gerar um build iOS é utilizar um serviço de build macOS, como o **EAS Build**, ou CI baseado em macOS.

Referência:

```text
https://docs.expo.dev/more/expo-cli/
```

---

# iOS — testar diretamente em iPhone físico

Este é o caminho mais simples quando o desenvolvedor possui um Mac.

Conecte o iPhone por USB.

No iPhone, em versões modernas do iOS, habilite **Developer Mode** quando necessário.

Na raiz do projeto:

```bash
npx expo run:ios --device
```

O Expo apresentará os dispositivos disponíveis.

Selecione o iPhone.

O Expo CLI pode:

```text
gerar ios/ se necessário
        ↓
executar Xcode build
        ↓
configurar assinatura de desenvolvimento
        ↓
instalar no iPhone
        ↓
abrir o ControlBit
```

A documentação atual do Expo informa que `npx expo run:ios --device` pode assinar automaticamente o aplicativo para desenvolvimento, instalar e iniciar no dispositivo quando a configuração de signing está disponível.

Referência:

```text
https://docs.expo.dev/more/expo-cli/
```

---

## Abrir o projeto no Xcode

Depois que `ios/` existir:

```bash
xed ios
```

Ou abra manualmente o arquivo `.xcworkspace` criado pelo projeto.

Dentro do Xcode:

```text
Project
→ Target
→ Signing & Capabilities
```

Selecione a equipe Apple adequada em:

```text
Team
```

Depois selecione o iPhone como destino e use:

```text
Product
→ Run
```

Esse fluxo é útil principalmente para:

- investigar erros nativos;
- configurar signing;
- verificar capabilities;
- analisar logs;
- testar diretamente no aparelho.

---

# iOS — build Release para diagnóstico

Para testar um problema que só ocorre em Release:

```bash
npx expo run:ios --configuration Release
```

Esse comando gera uma compilação Release local, mas **não deve ser interpretado automaticamente como um artefato pronto para envio à App Store**.

O Expo recomenda Xcode/EAS para o fluxo de assinatura e distribuição de produção.

---

# iOS — gerar `.app` de simulador

É possível gerar um `.app` para um destino genérico de **iOS Simulator**:

```bash
npx expo run:ios \
  --configuration Release \
  --device generic \
  --output ./build/ios-simulator
```

A saída será semelhante a:

```text
build/ios-simulator/controlbit.app
```

Esse formato é útil para:

- CI;
- testes em simuladores;
- compartilhar um build de simulador entre Macs compatíveis.

> **Esse `.app` é compilado para iOS Simulator e não deve ser usado para instalar em iPhone físico.**

---

# iOS — gerar IPA com Xcode para dispositivo físico

Para gerar um IPA para teste/distribuição, o fluxo mais seguro para desenvolvedores internos é usar o Xcode.

## 1. Gerar projeto iOS

Na raiz:

```bash
npx expo prebuild -p ios
```

## 2. Abrir Xcode

```bash
xed ios
```

## 3. Configurar assinatura

No target do ControlBit:

```text
Signing & Capabilities
→ Team
→ selecionar equipe Apple
```

Confirme o Bundle Identifier:

```text
com.dejesusdev.controlbit
```

Esse valor já está declarado no `app.json`.

## 4. Selecionar destino genérico de dispositivo

No topo do Xcode, selecione um destino equivalente a:

```text
Any iOS Device (arm64)
```

ou um dispositivo físico compatível.

## 5. Gerar Archive

No menu:

```text
Product
→ Archive
```

Ao finalizar, o Xcode abrirá o Organizer.

## 6. Distribuir

No Organizer:

```text
Archives
→ selecionar ControlBit
→ Distribute App
```

Escolha o método apropriado.

Para testes internos, os caminhos mais relevantes são:

```text
Development
Ad Hoc / Registered Devices
TestFlight
```

O Xcode pode exportar uma pasta contendo o arquivo:

```text
.ipa
```

A Apple documenta que o fluxo de exportação para dispositivos registrados produz um IPA.

Referências:

```text
https://developer.apple.com/documentation/xcode/distributing-your-app-to-registered-devices
https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases
```

---

# iOS — IPA Development / Ad Hoc

Para instalar um IPA fora da App Store, o dispositivo precisa estar incluído na forma de provisioning escolhida.

Em uma distribuição para **registered devices / Ad Hoc**, normalmente são necessários:

```text
Apple Developer Program
App ID
certificado de distribuição/desenvolvimento adequado
UDID do iPhone registrado
provisioning profile
IPA assinado
```

A Apple exige que os dispositivos destinados ao teste Ad Hoc sejam registrados.

Isso significa que não é possível simplesmente enviar qualquer IPA para qualquer iPhone da mesma forma que um APK Android.

Fluxo:

```text
iPhone
  ↓
registrar UDID
  ↓
Provisioning Profile
  ↓
Archive no Xcode
  ↓
Export / Distribute App
  ↓
ControlBit.ipa
  ↓
instalação no dispositivo autorizado
```

---

# iOS — TestFlight

Para testes com um grupo maior, prefira TestFlight.

Fluxo:

```text
Xcode Archive ou EAS Build
        ↓
App Store Connect
        ↓
TestFlight
        ↓
Internal Testers / External Testers
        ↓
iPhone
```

TestFlight evita o processo de enviar um IPA manualmente para cada usuário e é mais próximo do fluxo real de distribuição.

A Apple permite distribuir um archive pelo App Store Connect para beta testing via TestFlight.

---

# iOS — build por linha de comando com Xcode

Para automações/CI avançado, é possível utilizar `xcodebuild`.

Primeiro descubra os schemes e workspaces reais gerados:

```bash
find ios -maxdepth 2 \( -name "*.xcworkspace" -o -name "*.xcodeproj" \) -print
```

Depois consulte os schemes:

```bash
xcodebuild -list -workspace ios/<WORKSPACE>.xcworkspace
```

Exemplo de Archive:

```bash
xcodebuild \
  -workspace ios/<WORKSPACE>.xcworkspace \
  -scheme <SCHEME> \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath build/ControlBit.xcarchive \
  archive
```

Depois, para exportar:

```bash
xcodebuild \
  -exportArchive \
  -archivePath build/ControlBit.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath build/ios
```

O arquivo:

```text
ExportOptions.plist
```

define a estratégia de distribuição e assinatura.

> Evite copiar cegamente um `ExportOptions.plist` antigo entre versões do Xcode. Gere/valide a configuração com a versão de Xcode usada pela equipe.

Para o trabalho cotidiano, prefira o Organizer do Xcode. Use `xcodebuild` quando houver necessidade de CI/CD ou builds reproduzíveis.

---

# EAS Build — alternativa para Android e iOS

O projeto usa Expo, portanto o **EAS Build** pode ser adotado como alternativa ao build totalmente local.

Essa opção é particularmente importante para desenvolvedores em:

```text
Linux
Windows
```

que precisam gerar iOS sem possuir um Mac local.

O EAS executa o build iOS em infraestrutura macOS remota.

---

## Configurar EAS

Sem instalar CLI globalmente:

```bash
npx eas-cli@latest login
```

Depois:

```bash
npx eas-cli@latest build:configure
```

Isso cria/configura:

```text
eas.json
```

> O ControlBit não deve passar a depender de EAS implicitamente. Caso a equipe adote esse fluxo oficialmente, versione e documente o `eas.json`.

---

## Exemplo de perfis EAS

Um exemplo inicial para discussão da equipe:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

### `development`

Indicado para development builds e Metro.

Pode exigir:

```bash
npx expo install expo-dev-client
```

Não instale essa dependência apenas para seguir o README se a equipe não tiver decidido usar development builds EAS.

### `preview`

Indicado para um aplicativo standalone de testes internos.

### `production`

Indicado para artefatos destinados às lojas.

---

## Android com EAS

Preview/internal:

```bash
npx eas-cli@latest build \
  --platform android \
  --profile preview
```

Para produção:

```bash
npx eas-cli@latest build \
  --platform android \
  --profile production
```

Em produção, o formato Android padrão é tipicamente voltado à Play Store (`AAB`). Para distribuição interna, o perfil pode ser configurado para produzir um APK instalável.

Referência:

```text
https://docs.expo.dev/build-reference/apk/
```

---

## iOS físico com EAS

Para um build iOS instalável em dispositivo físico é necessário configurar assinatura/provisioning Apple.

Uma estratégia de distribuição interna:

```bash
npx eas-cli@latest build \
  --platform ios \
  --profile preview
```

Para development build:

```bash
npx eas-cli@latest build \
  --platform ios \
  --profile development
```

Development builds iOS para dispositivo físico são gerados em formato:

```text
.ipa
```

O Expo documenta que esse fluxo exige credenciais Apple e provisioning para os dispositivos.

Para registrar um aparelho quando necessário:

```bash
npx eas-cli@latest device:create
```

Depois gere novamente o build incluindo o dispositivo registrado.

Referência:

```text
https://docs.expo.dev/tutorial/eas/ios-development-build-for-devices/
```

---

## EAS iOS a partir de Linux/Windows

Fluxo conceitual:

```text
Linux / Windows
      ↓
código ControlBit
      ↓
EAS CLI
      ↓
EAS Build em macOS remoto
      ↓
assinatura Apple
      ↓
IPA
      ↓
iPhone / TestFlight
```

Isso resolve a limitação de não existir Xcode para Linux/Windows.

Entretanto, ainda existem requisitos Apple:

- conta apropriada;
- certificados;
- provisioning;
- dispositivos registrados quando a distribuição exigir;
- Developer Mode para development builds em versões aplicáveis do iOS.

---

# Atenção especial: Bluetooth no iOS

Gerar e instalar o ControlBit em um iPhone **não significa que todos os modos Bluetooth atuais funcionarão da mesma forma que no Android**.

O projeto possui:

```text
BLE
Bluetooth Classic
```

### BLE

A pilha baseada em:

```text
react-native-ble-plx
```

é o caminho mais adequado para validação no iOS, desde que as permissões, serviços e characteristics utilizadas pelo periférico sejam compatíveis.

O `app.json` já contém:

```text
NSBluetoothAlwaysUsageDescription
NSBluetoothPeripheralUsageDescription
```

e o plugin do BLE.

### Bluetooth Classic / HC-05 / HC-06

O iOS possui restrições importantes para Bluetooth Classic.

A própria documentação de:

```text
react-native-bluetooth-classic
```

explica que comunicação Classic no iOS passa pelo framework:

```text
ExternalAccessory
```

e por dispositivos/protocolos compatíveis com o programa **MFi** da Apple.

Portanto, módulos comuns:

```text
HC-05
HC-06
```

que funcionam por SPP no Android **não devem ser considerados automaticamente compatíveis com iPhone**.

Antes de declarar suporte iOS para Bluetooth Classic, a equipe precisa validar:

```text
hardware
MFi
protocol strings
Info.plist
biblioteca nativa
fluxo de conexão
```

Referências:

```text
https://kenjdavidson.com/react-native-bluetooth-classic/
https://kenjdavidson.com/react-native-bluetooth-classic/ios/
```

Para compatibilidade multiplataforma, prefira testar periféricos BLE quando possível.

---

# Resumo — qual artefato gerar?

## Quero testar rapidamente no meu Android

```bash
cd android
./gradlew assembleRelease
```

Depois:

```bash
adb install -r app/build/outputs/apk/release/app-release.apk
```

---

## Quero testar uma build de desenvolvimento Android

```bash
cd android
./gradlew assembleDebug
```

---

## Quero enviar para Google Play

Antes do build:

```text
applicationId = com.dejesusdev.controlbit
versionCode   = maior que o último valor enviado
Upload Key    = certificado aceito pelo Google Play
```

Execute na raiz:

```bash
./build-android-release.sh
```

O script valida a keystore, a assinatura Gradle e o certificado do AAB final.

Resultado:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

---

## Quero rodar diretamente em um iPhone conectado

Em um Mac:

```bash
npx expo run:ios --device
```

---

## Quero gerar um IPA para iPhone

Em um Mac:

```text
Xcode
→ Product
→ Archive
→ Distribute App
→ Development / Ad Hoc
→ Export
```

Ou use EAS Build com provisioning configurado.

---

## Quero testar pelo TestFlight

```text
Archive / EAS Production Build
        ↓
App Store Connect
        ↓
TestFlight
```

---

## Estou no Linux/Windows e preciso gerar iOS

Não é possível executar Xcode localmente.

Use:

```text
EAS Build
```

ou outra infraestrutura CI/macOS.

---

# Versionamento antes de builds distribuíveis

Antes de publicar uma nova versão, revise:

```text
expo.version
android.versionCode
android.package / applicationId
ios.buildNumber
```

Para o aplicativo Android já cadastrado no Google Play, o identificador deve permanecer:

```text
com.dejesusdev.controlbit
```

O `versionCode` precisa ser um inteiro maior que qualquer código já utilizado no Play Console.

Exemplo:

```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "package": "com.dejesusdev.controlbit",
      "versionCode": 2
    },
    "ios": {
      "buildNumber": "2"
    }
  }
}
```

Conceitualmente:

```text
version
→ versão exibida ao usuário
→ ex.: 1.0.1

android.versionCode
→ inteiro crescente a cada upload no Google Play
→ não pode ser reutilizado

android.package / applicationId
→ identidade do aplicativo
→ deve permanecer com.dejesusdev.controlbit para atualizar o app existente

ios.buildNumber
→ build crescente por release iOS
```

No projeto Android nativo, confirme também:

```bash
grep -n "applicationId\|versionCode\|versionName" android/app/build.gradle
```

Exemplo esperado:

```text
applicationId 'com.dejesusdev.controlbit'
versionCode 2
versionName "1.0.1"
```

Como o projeto usa Expo Prebuild, prefira guardar configurações persistentes no:

```text
app.json
```

quando houver suporte para essa propriedade, evitando que um `prebuild` reverta mudanças feitas apenas em arquivos nativos.

---

# Checklist de build distribuível

Antes de compartilhar um APK, AAB ou IPA:

- [ ] `npm ci` executado.
- [ ] `npx expo-doctor` sem erro crítico.
- [ ] Versão revisada.
- [ ] Build gerado em modo correto.
- [ ] Assinatura verificada.
- [ ] SHA-1 da keystore corresponde à Upload Key cadastrada no Google Play.
- [ ] SHA-1 do AAB final corresponde à mesma Upload Key.
- [ ] `applicationId` permanece `com.dejesusdev.controlbit`.
- [ ] `versionCode` é maior que qualquer código já enviado ao Google Play.
- [ ] Build de publicação foi gerado por `./build-android-release.sh`.
- [ ] Nenhum keystore/certificado privado/senha foi commitado.
- [ ] Aplicativo instalado em dispositivo físico.
- [ ] Home abre corretamente.
- [ ] Controle básico funciona.
- [ ] Controle customizável funciona.
- [ ] Persistência funciona após reiniciar o app.
- [ ] Permissões Bluetooth funcionam.
- [ ] BLE foi testado quando aplicável.
- [ ] Bluetooth Classic foi testado no Android quando aplicável.
- [ ] iOS não foi declarado compatível com HC-05/HC-06 sem validação MFi.
- [ ] Build Release funciona sem Metro.
- [ ] Package/Bundle Identifier continua `com.dejesusdev.controlbit`.
- [ ] Artefato correto foi selecionado para o destino: APK, AAB ou IPA.

---

# Fluxo diário de desenvolvimento

Depois de realizar o primeiro build nativo, alterações apenas em:

```text
.ts
.tsx
.js
.jsx
.css
```

normalmente não exigem recompilar o APK.

Execute:

```bash
npm start
```

Se o aplicativo não conseguir se comunicar com o Metro usando USB:

```bash
adb reverse tcp:8081 tcp:8081
```

Depois:

```bash
npm start
```

Para verificar:

```bash
adb reverse --list
```

---

# Bluetooth

O Bluetooth é uma das partes centrais da aplicação.

A implementação principal fica em:

```text
src/context/BluetoothContext.tsx
```

O contexto expõe:

```ts
status
device
isConnected
isScanning
bluetoothEnabled
scannedDevices
startScan()
stopScan()
connectToDevice()
disconnect()
sendCommand()
```

Estados possíveis:

```text
disconnected
scanning
connecting
connected
```

---

## Permissões Android

O `app.json` declara:

```text
android.permission.BLUETOOTH
android.permission.BLUETOOTH_ADMIN
android.permission.BLUETOOTH_CONNECT
android.permission.BLUETOOTH_SCAN
android.permission.ACCESS_FINE_LOCATION
android.permission.ACCESS_COARSE_LOCATION
```

Em Android 12 ou superior, o código solicita permissões granulares de Bluetooth.

Ao abrir o aplicativo pela primeira vez, aceite as permissões solicitadas.

---

## Bluetooth Classic

Biblioteca:

```text
react-native-bluetooth-classic
```

Projetado principalmente para módulos:

```text
HC-05
HC-06
```

### Pareamento

Para HC-05/HC-06, faça primeiro o pareamento pelo sistema Android:

```text
Configurações
→ Bluetooth
→ HC-05 / HC-06
→ Parear
```

O aplicativo usa dispositivos já pareados através de:

```ts
RNBluetoothClassic.getBondedDevices()
```

A conexão é aberta através de SPP.

### Fluxo

```text
Android Bluetooth
        ↓
getBondedDevices()
        ↓
lista de dispositivos
        ↓
connectToDevice()
        ↓
socket SPP
        ↓
sendCommand()
```

---

## Bluetooth BLE

Biblioteca:

```text
react-native-ble-plx
```

O scan BLE usa:

```ts
manager.startDeviceScan(...)
```

O projeto identifica atualmente dois padrões de serviço BLE.

### HM-10

Service UUID:

```text
0000ffe0-0000-1000-8000-00805f9b34fb
```

Characteristic UUID:

```text
0000ffe1-0000-1000-8000-00805f9b34fb
```

### UART BLE / Nordic UART

Service UUID:

```text
6e400001-b5a3-f393-e0a9-e50e24dcca9e
```

RX UUID:

```text
6e400003-b5a3-f393-e0a9-e50e24dcca9e
```

Após conectar, o aplicativo descobre os serviços e determina automaticamente se o dispositivo utiliza:

```text
hm10
```

ou:

```text
uart
```

---

# Comandos enviados aos dispositivos

O contexto Bluetooth acrescenta uma quebra de linha ao comando:

```ts
const cmdNL = command + "\n";
```

Isso significa que um comando:

```text
up
```

é transmitido como:

```text
up\n
```

O firmware do microcontrolador deve considerar essa terminação de linha ao interpretar os comandos.

Para Bluetooth Classic, o comando é enviado como texto pelo socket SPP.

Para BLE, o comando é codificado e enviado pela characteristic correspondente ao protocolo detectado.

---

# Controle básico

Tela principal:

```text
src/screens/BasicControl/index.tsx
```

Componentes relacionados:

```text
src/components/ControlPad.tsx
src/components/ServoSlider.tsx
src/components/BasicCommandSettingsModal.tsx
src/components/BluetoothButton.tsx
```

O controle básico consome:

```ts
useBluetooth()
```

principalmente:

```ts
isConnected
sendCommand
```

Comandos padrão:

```ts
{
  up: "up",
  down: "down",
  left: "left",
  right: "right",
  horn: "horn",
  stop: "stop"
}
```

Os comandos podem ser alterados pelo usuário.

---

# Controle customizável

Principais telas:

```text
src/screens/CustomControl/
src/screens/CustomPlay/
```

Componentes relacionados:

```text
DraggableButton.tsx
IconPickerModal.tsx
ProfilePickerModal.tsx
```

Tipos principais:

```ts
interface ControlButton {
  id: string;
  icon: string;
  command: string;
  label: string;
  x?: number;
  y?: number;
  size?: number;
  color?: string;
}
```

Perfil:

```ts
interface ControlProfile {
  id: string;
  name: string;
  buttons: ControlButton[];
  isDefault?: boolean;
  orientation?: "portrait" | "landscape";
}
```

---

## Perfis padrão

### Carro Padrão

Orientação:

```text
portrait
```

Comandos principais:

```text
up
down
left
right
horn
```

### Braço Robótico

Orientação:

```text
landscape
```

Comandos principais:

```text
base_cw
base_ccw
claw_open
claw_close
```

---

# Persistência local

O projeto utiliza:

```text
@react-native-async-storage/async-storage
```

Nenhum backend é necessário para armazenar configurações locais.

## Idioma

Chave:

```text
@controlbit:language
```

## Controle básico

Chave:

```text
@dogo_maker_basic_commands
```

## Perfis customizados

Chave:

```text
@controlbit_profiles_v1
```

## Perfil ativo

Chave:

```text
@controlbit_active_profile
```

## Resetando dados de desenvolvimento

Para limpar todos os dados do aplicativo no Android:

```bash
adb shell pm clear com.dejesusdev.controlbit
```

Atenção: esse comando remove todas as configurações locais do aplicativo.

---

# Internacionalização

Arquivos principais:

```text
src/context/LanguageContext.tsx
src/i18n/translations.ts
```

Idiomas atualmente suportados:

```text
pt
es
en
```

Idioma padrão:

```text
pt
```

Uso:

```ts
const { t } = useLanguage();

<Text>{t("alguma_chave")}</Text>
```

Para adicionar uma nova tradução:

1. adicione a chave em `translations.ts`;
2. forneça o texto para todos os idiomas;
3. use `t("chave")` no componente.

---

# Orientação de tela

Hook:

```text
src/hooks/useScreenOrientation.ts
```

Biblioteca:

```text
expo-screen-orientation
```

A aplicação utiliza orientação de tela em cenários como:

- controle básico;
- CustomPlay;
- perfis customizados.

Perfis podem utilizar:

```ts
orientation: "portrait"
```

ou:

```ts
orientation: "landscape"
```

---

# Navegação

Bibliotecas:

```text
@react-navigation/native
@react-navigation/bottom-tabs
@react-navigation/native-stack
```

As bottom tabs atuais são:

```text
home
basiccontrol
customcontrol
```

O Stack principal inclui:

```text
tabs
customcontrol
customplay
```

`CustomPlay` é apresentado em modo full screen.

---

# Estilização

O projeto mistura:

- NativeWind;
- Tailwind;
- estilos inline do React Native;
- constantes do tema.

Arquivos principais:

```text
global.css
tailwind.config.js
metro.config.js
src/constants/theme.ts
```

O Metro utiliza:

```js
withNativeWind(config, {
  input: "./global.css"
})
```

Fontes principais incluídas:

```text
SpaceGrotesk-Bold
SpaceGrotesk-Medium
SpaceMono-Regular
SpaceMono-Bold
```

---

# Scripts NPM

Scripts disponíveis no `package.json`:

| Comando | Descrição |
|---|---|
| `npm start` | Inicia Expo/Metro |
| `npm run android` | Compila e executa Android |
| `npm run ios` | Compila e executa iOS |
| `npm run web` | Inicia versão web |
| `npm run device` | Compila Android e permite selecionar dispositivo físico |
| `npm run postinstall` | Aplicado automaticamente pelo npm para executar `patch-package` |

Uso recomendado em Android físico:

```bash
npm run device
```

Depois do primeiro build:

```bash
npm start
```

---

# Expo Go

Não utilize Expo Go como ambiente principal para testar Bluetooth neste projeto.

O aplicativo depende de módulos nativos:

```text
react-native-ble-plx
react-native-bluetooth-classic
```

Portanto, é necessário gerar um build nativo/development build.

Fluxo correto:

```text
npm run device
      ↓
Expo Prebuild
      ↓
Gradle
      ↓
APK
      ↓
ADB
      ↓
Android físico
```

---

# Alterações nativas e Prebuild

Mudanças apenas em JavaScript/TypeScript normalmente não exigem recompilação nativa.

Entretanto, após alterações como:

- instalar biblioteca React Native nativa;
- alterar plugins do Expo;
- alterar permissões;
- alterar configuração Android;
- atualizar Expo SDK;
- atualizar bibliotecas Bluetooth;

recomenda-se:

```bash
npx expo prebuild --clean
```

Depois:

```bash
npm run device
```

> `prebuild --clean` recria os diretórios nativos. Não mantenha alterações manuais importantes em `android/` sem documentá-las ou transformá-las em configuração/plugin reproduzível.

---

# Deploy da versão Web (produção)

A versão web (Expo Web + `react-native-web`, com Bluetooth via Web Bluetooth API — veja a seção "Bluetooth" mais abaixo) pode ser publicada como um site estático comum, acessível por qualquer pessoa em um link HTTPS. **HTTPS não é opcional aqui**: o Web Bluetooth só funciona em contexto seguro (HTTPS ou `localhost`).

## Build local do site estático

```bash
npm run build:web
```

Isso executa `expo export -p web` e gera a pasta `dist/` com um site 100% estático (HTML, JS, CSS e assets) — pode ser testado localmente com qualquer servidor estático, por exemplo:

```bash
npx serve dist
```

## Deploy na Vercel (recomendado)

O repositório já inclui um [`vercel.json`](vercel.json) configurado (build command, diretório de saída e rewrite de SPA para as rotas do React Navigation).

1. Acesse [vercel.com](https://vercel.com) e crie uma conta gratuita (pode entrar direto com o login do GitHub).
2. Clique em **Add New → Project** e importe o repositório `educarbr11/controlbit-v2`.
3. Selecione a branch que você quer publicar (ex.: `web`, ou `master` depois de dar merge).
4. A Vercel detecta o `vercel.json` automaticamente — não precisa configurar build command/output manualmente.
5. Clique em **Deploy**. Ao final, a Vercel entrega uma URL pública em `https://<algum-nome>.vercel.app`, já em HTTPS.

A partir daí, todo novo `git push` na branch conectada gera um novo deploy automático.

### Domínio próprio (opcional)

Em **Project Settings → Domains**, adicione seu domínio e siga as instruções de DNS (registro `CNAME` ou `A`, conforme o caso) mostradas pela própria Vercel. O certificado HTTPS é emitido automaticamente.

## Deploy no Dokploy (self-hosted)

[Dokploy](https://dokploy.com) é uma alternativa self-hosted à Vercel/Netlify (roda no seu próprio VPS, com Traefik + Let's Encrypt por baixo). O repositório já inclui um [`Dockerfile`](Dockerfile) multi-stage (build do site estático + Nginx servindo o resultado) e o [`docker/nginx.conf`](docker/nginx.conf) com o fallback de SPA.

**Pré-requisito importante:** diferente da Vercel (que dá um domínio `*.vercel.app` de graça), o Dokploy usa Let's Encrypt, que **não emite certificado para IP puro** — você precisa de um domínio (ou subdomínio) próprio apontando para o IP do seu VPS via DNS antes de configurar o HTTPS. Sem HTTPS, o Web Bluetooth não funciona.

Passo a passo:

1. No painel do Dokploy, crie um **Project** (ou use um existente) e dentro dele **Create Application**.
2. Em **General → Git Provider**, conecte o repositório `educarbr11/controlbit-v2` (via GitHub App do próprio Dokploy) e escolha a branch a publicar (`web`, ou `master` após merge).
3. Em **Build Type**, selecione **Dockerfile** — o Dokploy já vai detectar o `Dockerfile` na raiz do repositório (Docker Path: `Dockerfile`, Docker Context Path: `.`).
4. Em **Domains**, adicione seu domínio/subdomínio, porta do container **80** e ative **HTTPS** (o Dokploy emite o certificado Let's Encrypt automaticamente depois que o DNS estiver apontando corretamente).
5. Clique em **Deploy**. O Dokploy builda a imagem (roda `npm ci` + `npm run build:web` dentro do container) e sobe o Nginx servindo `dist/`.

A partir daí, um novo `git push` na branch conectada dispara um novo build/deploy automaticamente (webhook do Dokploy), do mesmo jeito que a Vercel.

> Para testar o `Dockerfile` localmente antes de conectar ao Dokploy: `docker build -t controlbit-web . && docker run -p 8080:80 controlbit-web` e acesse `http://localhost:8080`.

## Alternativas de hospedagem

Qualquer host de site estático com HTTPS serve, desde que sirva `dist/index.html` como fallback para rotas não encontradas (SPA fallback) — necessário porque a navegação (`@react-navigation`) é toda client-side:

- **Netlify**: build command `npm run build:web`, publish directory `dist`, e uma regra de redirect `/* /index.html 200` em `netlify.toml` ou `_redirects`.
- **Cloudflare Pages** / **GitHub Pages**: mesmo princípio — build estático + fallback de SPA. No GitHub Pages, como o site fica em um subcaminho (`usuario.github.io/repo`), é necessário também configurar `baseUrl` no Metro/Expo, o que dá mais trabalho do que Vercel/Netlify.
- **Servidor próprio (VPS/Nginx) sem Dokploy**: sirva o conteúdo de `dist/` diretamente e configure `try_files $uri /index.html;` no Nginx, com HTTPS via Let's Encrypt/Certbot manual.

## Limitações a lembrar em produção

- **Bluetooth Classic (HC-05/HC-06) nunca funciona na web** — apenas micro:bit e módulos BLE (HM-10/HC-08). Veja a seção de [Troubleshooting da versão web](#versão-web-navegador-não-suportado-no-chromelinux) para detalhes.
- No **Linux**, quem acessar pelo Chrome/Edge precisa habilitar `chrome://flags/#enable-experimental-web-platform-features` manualmente — isso é uma limitação do navegador, não do seu deploy.
- O controle por inclinação (acelerômetro) fica oculto na web, já que desktops não têm esse sensor.

---

# Troubleshooting

## `android/` ou `ios/` não existe ao tentar gerar Release

O projeto utiliza Expo Prebuild, portanto os diretórios nativos podem não existir logo após o clone.

Android:

```bash
npx expo prebuild -p android
```

iOS, somente no macOS com toolchain Apple:

```bash
npx expo prebuild -p ios
```

Depois execute novamente o build correspondente.

---


## `expo` não encontrado

Execute:

```bash
npm install expo
```

Depois:

```bash
npm run device
```

## Verificar integridade do ambiente Expo

```bash
npx expo-doctor
```

## Celular não aparece no ADB

```bash
adb kill-server
adb start-server
adb devices
```

Também verifique:

```bash
lsusb
```

Se necessário:

```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
```

Desconecte e reconecte o aparelho.

## ADB mostra `unauthorized`

Execute:

```bash
adb devices
```

Desbloqueie o celular e aceite a solicitação de depuração USB.

Se necessário:

```bash
adb kill-server
adb start-server
```

## Metro não conecta ao aplicativo

```bash
adb reverse tcp:8081 tcp:8081
npm start
```

## Limpar cache do Metro

```bash
npx expo start -c
```

## Limpar build Android

Para desenvolvimento comum, evite usar `./gradlew clean` como primeira opção neste projeto, pois a New Architecture pode acionar a limpeza nativa do CMake sobre diretórios de Codegen ausentes.

Se a pasta `android/` já existir:

```bash
cd android

rm -rf app/.cxx
rm -rf .cxx
rm -rf app/build
rm -rf build

./gradlew generateCodegenArtifactsFromSchema

cd ..
npm run device
```

Se o problema estiver relacionado a mudanças de plugins Expo, permissões ou dependências nativas, considere também `npx expo prebuild --clean`, lembrando que ele recria os diretórios nativos.

## Recriar projeto Android

Quando o projeto nativo ficar inconsistente:

```bash
npx expo prebuild --clean
npm run device
```

## `validateSigningRelease` procura `/caminho/para/sua/upload-keystore.jks`

Se aparecer:

```text
Keystore file '/caminho/para/sua/upload-keystore.jks' not found
for signing config 'release'
```

há um placeholder de assinatura sendo lido pelo Gradle.

Remova do:

```text
android/gradle.properties
```

valores como:

```properties
MYAPP_UPLOAD_STORE_FILE=/caminho/para/sua/upload-keystore.jks
MYAPP_UPLOAD_KEY_ALIAS=seu-alias
MYAPP_UPLOAD_STORE_PASSWORD=...
MYAPP_UPLOAD_KEY_PASSWORD=...
```

Depois execute o fluxo oficial:

```bash
./build-android-release.sh
```

O script fornece as credenciais de forma temporária.

## `externalNativeBuildCleanRelease` falha com `generated/source/codegen/jni`

Se o erro mencionar:

```text
GLOB mismatch
add_subdirectory
generated/source/codegen/jni
externalNativeBuildCleanRelease
```

não insista em:

```bash
./gradlew clean
```

Remova os artefatos nativos diretamente:

```bash
cd android

rm -rf app/.cxx
rm -rf .cxx
rm -rf app/build
rm -rf build

./gradlew generateCodegenArtifactsFromSchema
```

Depois retorne à raiz e gere a Release com:

```bash
./build-android-release.sh
```

## Google Play informa `versionCode` já utilizado

Cada upload precisa de um código maior.

Exemplo:

```gradle
versionCode 2
versionName "1.0.1"
```

No upload seguinte:

```gradle
versionCode 3
```

Nunca reutilize um `versionCode` já enviado, mesmo que a versão anterior não tenha chegado à produção.

## Google Play exige `com.dejesusdev.controlbit`

O cadastro existente no Play Console pertence a:

```text
com.dejesusdev.controlbit
```

Portanto, para atualizar esse aplicativo:

```gradle
applicationId 'com.dejesusdev.controlbit'
```

Um AAB com:

```text
com.dogomaker.controlbit
```

representa outro aplicativo e não pode atualizar o cadastro existente.

## HC-05 / HC-06 não aparece

Confirme primeiro se o módulo foi pareado nas configurações do Android.

Depois abra novamente o scan no aplicativo.

Valide:

```text
Android
→ Configurações
→ Bluetooth
→ Dispositivos pareados
```

O HC-05/HC-06 deve estar nessa lista.

## BLE aparece mas não conecta

Verifique:

- permissões de dispositivos próximos;
- Bluetooth ligado;
- localização quando exigida pela versão do Android;
- se o dispositivo está conectado a outro celular;
- se o firmware expõe o serviço esperado;
- se o módulo utiliza HM-10 FFE0/FFE1 ou UART compatível.

## Versão web: "Navegador não suportado" no Chrome/Linux

O Web Bluetooth funciona nativamente (sem flag) no Chrome/Edge do Windows, macOS, ChromeOS e Android. No **Linux**, porém, o recurso ainda é tratado como experimental e vem desativado por padrão — por isso o aviso aparece mesmo em máquinas onde o Bluetooth do sistema operacional funciona normalmente (o Bluetooth nativo do Linux não tem relação com o suporte do Chrome à API Web Bluetooth).

Para habilitar:

```text
1. Acesse chrome://flags/#enable-experimental-web-platform-features
2. Ative a flag ("Enabled")
3. Reinicie o Chrome completamente
4. Acesse novamente http://localhost:8081 (ou o domínio HTTPS da versão publicada)
```

Depois disso, `navigator.bluetooth` passa a existir e o botão de conectar abre o seletor nativo do navegador.

## Versão web: micro:bit não aparece na lista de dispositivos

Diferente do app nativo (que descobre os serviços após conectar), o Web Bluetooth só mostra no seletor os dispositivos cujo pacote de anúncio (advertising) corresponda a um filtro declarado — e o micro:bit normalmente **não** anuncia o UUID do serviço UART (128 bits) nesse pacote, só o nome. Por isso o app filtra o micro:bit pelo prefixo do nome (`BBC micro:bit ...`) em vez do serviço.

Se mesmo assim ele não aparecer:

- confirme que o micro:bit está com o Bluetooth ativo e anunciando (LED de status conforme o firmware do MakeCode);
- confirme que ele não está pareado/conectado a outro dispositivo (celular, outro navegador) no momento;
- aproxime o computador do micro:bit — o alcance do BLE via adaptador de notebook costuma ser mais curto que o de um celular.

Módulos HM-10/HC-08 são filtrados pelo serviço `0xFFE0`, que costuma ser anunciado normalmente. **HC-05/HC-06 (Bluetooth Classic/SPP) não aparecem nunca na versão web** — o navegador não suporta esse protocolo; use um módulo BLE ou o aplicativo mobile.

## Build falha após instalar dependência nativa

Tente:

```bash
npm install
npx expo prebuild --clean
npm run device
```

Se o erro envolver CMake, `externalNativeBuildCleanRelease`, `GLOB mismatch` ou diretórios `generated/source/codegen/jni`, use a limpeza nativa segura:

```bash
cd android

rm -rf app/.cxx
rm -rf .cxx
rm -rf app/build
rm -rf build

./gradlew generateCodegenArtifactsFromSchema

cd ..
npm run device
```

Para um AAB de publicação, volte à raiz e execute:

```bash
./build-android-release.sh
```

---

# Logs e diagnóstico

## Logs do Metro

Rode:

```bash
npm start
```

e acompanhe o terminal.

## Logs do Android

Para visualizar logs do dispositivo:

```bash
adb logcat
```

Filtrando pelo pacote:

```bash
adb logcat | grep -i controlbit
```

Para React Native:

```bash
adb logcat | grep -i reactnative
```

## Verificar pacote instalado

```bash
adb shell pm list packages | grep controlbit
```

Esperado:

```text
package:com.dejesusdev.controlbit
```

## Remover aplicativo

```bash
adb uninstall com.dejesusdev.controlbit
```

---

# Configuração Expo

Arquivo:

```text
app.json
```

Package Android:

```text
com.dejesusdev.controlbit
```

Bundle Identifier iOS:

```text
com.dejesusdev.controlbit
```

Principais plugins:

```text
expo-font
expo-splash-screen
expo-screen-orientation
react-native-ble-plx
```

---

# Código legado ou experimental

Existem atualmente:

```text
src/context/ArduinoContext.tsx
src/screens/ArduinoControl/
```

Essa implementação é dedicada especificamente a HC-05/HC-06 usando Bluetooth Classic.

Porém, o fluxo principal do aplicativo atual utiliza:

```text
BluetoothProvider
BluetoothContext
BasicControl
```

`App.tsx` não registra `ArduinoProvider` e o `AppNavigator` atual não registra `ArduinoControl`.

Portanto, até que essa camada seja integrada explicitamente, trate `ArduinoContext` e `ArduinoControl` como código legado, experimental ou em processo de migração.

Não desenvolva funcionalidades novas nessa camada sem confirmar antes qual arquitetura Bluetooth será mantida.

A preferência arquitetural atual deve ser centralizar BLE e Classic em:

```text
src/context/BluetoothContext.tsx
```

---

# Pontos de atenção técnicos

## Tipagem de navegação

Ao alterar rotas, mantenha sincronizados:

```text
src/routes/routes.tsx
src/types/root-param-list.ts
src/types/navigation.types.ts
```

Qualquer nova tela deve ser registrada nos tipos de navegação e no navigator apropriado.

## Bluetooth é código nativo

Alterações nas bibliotecas Bluetooth podem exigir:

```bash
npx expo prebuild --clean
npm run device
```

Não assuma que apenas reiniciar o Metro será suficiente.

## Patch Package

O projeto utiliza:

```text
patch-package
```

e contém a pasta:

```text
patches/
```

Depois de alterar manualmente uma dependência dentro de `node_modules`, não faça commit do `node_modules`.

Se a correção precisar ser persistida, gere ou atualize o patch correspondente.

## Dependências

Antes de atualizar Expo ou React Native, verifique principalmente a compatibilidade de:

```text
react-native-ble-plx
react-native-bluetooth-classic
react-native-reanimated
nativewind
react-native-screens
```

Atualizações de SDK devem ser feitas em branch separada.

---

# Boas práticas para desenvolvimento

## Branches

Sugestão de convenção:

```text
feature/nome-da-feature
fix/nome-do-bug
refactor/nome-do-refactor
docs/nome-da-documentacao
```

Exemplos:

```text
feature/servo-control
fix/hc05-reconnect
docs/readme
```

## Commits

Sugestão:

```text
feat: adiciona controle de servo
fix: corrige reconexão BLE
refactor: centraliza conexão bluetooth
docs: atualiza instruções de instalação
chore: atualiza dependências
```

## Evite

- commit de `node_modules`;
- commit de APKs de debug;
- alterações manuais não documentadas em arquivos gerados pelo Prebuild;
- duplicar lógica Bluetooth em telas;
- acessar AsyncStorage diretamente em múltiplos componentes quando já existir um service;
- adicionar textos visíveis sem tradução;
- adicionar rota sem atualizar os tipos.

---

# Checklist antes de abrir um PR

- [ ] Aplicativo inicia sem erro.
- [ ] `npx expo-doctor` não aponta erro crítico.
- [ ] Build Android funciona.
- [ ] Aplicativo instala via `npm run device`.
- [ ] Navegação funciona.
- [ ] Alterações de UI funcionam em portrait.
- [ ] Alterações de UI funcionam em landscape quando aplicável.
- [ ] Permissões Bluetooth continuam funcionando.
- [ ] Scan BLE funciona quando a feature foi alterada.
- [ ] HC-05/HC-06 continua conectando quando código Bluetooth foi alterado.
- [ ] Comandos enviados possuem formato esperado pelo firmware.
- [ ] Novos textos possuem tradução PT/ES/EN.
- [ ] Dados persistidos continuam compatíveis.
- [ ] Nenhum segredo ou arquivo local foi incluído.
- [ ] Nenhum `node_modules` ou APK foi adicionado ao commit.

---

# Verificação rápida do ambiente

Antes de investigar problemas no projeto, rode no Linux/macOS:

```bash
uname -m
node -v
npm -v
java -version
echo "$JAVA_HOME"
echo "$ANDROID_HOME"
command -v adb
adb version
adb devices
npx expo-doctor
```

Para um ambiente funcional, espera-se aproximadamente:

```text
Arquitetura: x86_64 / arm64 / aarch64 conhecida
Node: v22.x
Java: 17.x
ANDROID_HOME: caminho válido para o SDK
ADB: preferencialmente o Platform-Tools do Android SDK
Dispositivo: listado como "device"
```

Se houver dúvida sobre qual ADB está sendo utilizado:

```bash
"$ANDROID_HOME/platform-tools/adb" version
"$ANDROID_HOME/platform-tools/adb" devices
```

No Windows PowerShell:

```powershell
$env:PROCESSOR_ARCHITECTURE
node -v
npm -v
java -version
$env:JAVA_HOME
$env:ANDROID_HOME
Get-Command adb
adb version
adb devices
npx expo-doctor
```

---

# Setup rápido para uma nova máquina Linux Mint

Depois de instalar Android Studio e configurar o SDK:

```bash
git clone https://github.com/educarbr11/controlbit-v2.git

cd controlbit-v2

npm ci
```

Se o Expo for solicitado:

```bash
npm install expo
```

Valide:

```bash
npx expo-doctor
```

Conecte o celular:

```bash
adb devices
```

Compile e instale:

```bash
npm run device
```

Após o primeiro build, no uso diário:

```bash
adb reverse tcp:8081 tcp:8081
npm start
```

---

# Fluxo resumido

```text
Linux Mint
   │
   ├── Node 22
   ├── OpenJDK 17
   ├── Android Studio
   ├── Android SDK
   └── ADB
        │
        ▼
git clone
        │
        ▼
npm ci
        │
        ├── se necessário → npm install expo
        │
        ▼
npx expo-doctor
        │
        ▼
adb devices
        │
        ▼
npm run device
        │
        ▼
Expo Prebuild
        │
        ▼
Gradle
        │
        ▼
APK debug
        │
        ▼
Android físico
        │
        ▼
Bluetooth
   ┌────┴────┐
   ▼         ▼
 Classic     BLE
HC-05/06   HM-10 / UART
```

---

# Scripts ainda não definidos

No estado atual do projeto, não há scripts NPM dedicados para:

```text
test
lint
typecheck
```

Caso o projeto evolua para CI/CD, recomenda-se adicionar pelo menos:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

E posteriormente configurar lint/testes de acordo com a estratégia da equipe.

---

# CI/CD

O fluxo atual é orientado a build local.

Para futuras automações, recomenda-se considerar:

- validação TypeScript;
- Expo Doctor;
- lint;
- testes;
- build Android;
- geração controlada de APK/AAB;
- versionamento automático.

---

# Segurança

Não adicione ao repositório:

- chaves privadas;
- keystores de produção;
- senhas;
- tokens;
- credenciais;
- arquivos `.env` contendo segredos.

Caso um keystore de produção seja criado, mantenha-o fora do Git e use um gerenciador de segredos apropriado.

No fluxo local de Release, `build-android-release.sh` fornece as credenciais ao Gradle apenas durante a execução e limpa as variáveis sensíveis ao terminar. Não substitua esse mecanismo por senhas versionadas em `android/gradle.properties`.

---

# Licença

O repositório contém uma licença MIT.

Consulte:

```text
LICENSE
```

para os termos completos.

---

# Registro de ambientes validados

Quando um desenvolvedor confirmar o fluxo completo em um novo ambiente, atualize a matriz de compatibilidade deste README.

Considere o ambiente **validado** somente quando pelo menos estes passos funcionarem:

```text
npm ci
npx expo-doctor
adb devices
npm run device
aplicativo abre no Android físico
scan Bluetooth funciona
conexão com pelo menos um dispositivo suportado funciona
envio de comando é confirmado
```

Ao registrar a validação, anote:

```text
Sistema operacional / distro
Versão
Arquitetura
Node
JDK
Android SDK
Modelo do celular
Versão do Android
Bluetooth testado (BLE / Classic)
```

---

# Manutenção deste README

Sempre atualize esta documentação quando houver mudanças em:

- versão do Expo;
- versão do React Native;
- processo de instalação;
- SDK Android;
- permissões;
- bibliotecas Bluetooth;
- formato dos comandos;
- arquitetura de navegação;
- persistência;
- idiomas;
- scripts NPM;
- processo de build.

Uma alteração técnica só está concluída quando a documentação relacionada também estiver atualizada.
