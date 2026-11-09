# ControlBit v2

App de controle para robótica educacional via Bluetooth (BLE e Classic/SPP), feito com **React Native + Expo**. Funciona com HM-10, HC-05/06, HC-08, micro:bit e outros módulos UART. Foco em Android; há também uma versão web (Web Bluetooth).

- **Controle básico** — direcional pronto, comandos configuráveis.
- **Controles customizados** — perfis com botões, ícones, comandos, tamanhos e posições próprios.
- **Acelerômetro** — dirija inclinando o celular.
- **Idiomas** e persistência local (AsyncStorage).

## Requisitos

| Ferramenta | Versão |
|---|---|
| Node.js | 22+ |
| JDK | 17 |
| Android SDK + ADB | Platform 35, Build-Tools 36 |
| Celular Android | Depuração USB ativa, cabo com dados |

`ANDROID_HOME` deve apontar para o SDK. Instruções detalhadas por sistema (Linux, macOS, Windows, udev, Android Studio) estão em [docs/guia-completo.md](docs/guia-completo.md).

## Começando

```bash
git clone <repo> && cd controlbit-v2
npm run setup      # valida o ambiente e instala as dependências
```

## Comandos do dia a dia

| Comando | O que faz |
|---|---|
| `npm run setup` | Checa Node/Java/ADB e roda `npm install` |
| `npm run web` | Roda no navegador |
| `npm run device` | Compila e instala no celular USB (desenvolvimento, com hot reload) |
| `npm run device:release` | Gera o APK release **assinado**, instala e abre no celular |
| `npm start` | Só o Metro (após o primeiro build nativo, mudanças em `.ts/.tsx` não exigem recompilar) |
| `npm run build:web` | Exporta o site estático em `dist/` |
| `npm test` | Roda os testes (perfis salvos e direção da inclinação) |

> Bluetooth é código nativo: **não funciona no Expo Go**. Use `npm run device`.

### Instalar no celular

```bash
npm run device            # debug
npm run device:release    # release
```

O script detecta o aparelho (pergunta qual, se houver vários), gera a pasta `android/` se ela não existir, compila e instala.

**Assinatura**

| Modo | Assinatura |
|---|---|
| `device` | Automática, com `android/app/debug.keystore` |
| `device:release` | Com a keystore que você informar. Sem keystore (Enter), usa a chave de debug: roda no celular, mas **não serve para a Play Store** |

Para não digitar toda vez: `cp .env.example .env.local` e preencha `CB_KEYSTORE` (aceita `~/`), `CB_KEY_ALIAS` e, se quiser, `CB_STORE_PASS`/`CB_KEY_PASS`. O `.env.local` é ignorado pelo git; variáveis já exportadas no shell têm prioridade. O mesmo `.env.local` é lido pelos `build-android-release*.sh` (que ainda aceitam `CB_EXPECTED_SHA1`, o SHA-1 da chave de upload no Play Console). O script de instalação valida a keystore antes de compilar e confere a assinatura do APK com `apksigner`.

Se já houver uma versão com assinatura diferente instalada (ex.: debug → release), o script oferece desinstalar e reinstalar (apaga os dados do app).

O script lê a arquitetura do aparelho (ex.: `arm64-v8a`) e compila o código nativo só para ela: build mais rápido e APK menor. Por isso o APK gerado aqui só roda em aparelhos com a mesma arquitetura; para distribuir, use os scripts da Play Store (que compilam todas).

Ao terminar (ou com Ctrl+C), o script encerra os daemons do Gradle e do Kotlin para não deixar RAM e cache pendurados.

Metro não conecta pelo USB? `adb reverse tcp:8081 tcp:8081`.

## Publicar na Play Store

```bash
./prebuild-android.sh              # regenera android/ a partir do app.json (se necessário)
./build-android-release.sh         # gera o .aab assinado + mapping.txt
./build-android-release-apk.sh     # idem, mas gera .apk
```

Esses scripts perguntam a versão, a keystore e o SHA-1 esperado pelo Google Play, e abortam se a assinatura não bater. A assinatura de release é aplicada por [plugins/withAndroidReleaseSigning.js](plugins/withAndroidReleaseSigning.js), que reaplica a configuração a cada `expo prebuild`.

> Nunca versione keystores (`*.jks` já está no `.gitignore`).

## Estrutura

```text
App.tsx            entrada: providers + navegação
src/components/    UI reutilizável (NeoButton, ControlPad, modais…)
src/context/       Bluetooth, Arduino e idioma
src/screens/       Home, BasicControl, CustomControl, CustomPlay
src/services/      persistência (comandos básicos e perfis)
src/i18n/          traduções
plugins/           config plugins do Expo
patches/           patches de dependências (patch-package)
scripts/           setup e instalação no celular
android/ ios/      gerados por prebuild — não versionados
```

Stack: Expo 56, React Native 0.85, React Navigation 7, NativeWind (Tailwind), Reanimated, `react-native-ble-plx` e `react-native-bluetooth-classic`.

## Web

`npm run build:web` gera `dist/`. Deploy na Vercel (`vercel.json`) ou via `Dockerfile` + Nginx (Dokploy). Requer navegador com Web Bluetooth (Chrome/Edge); só BLE.

## Problemas comuns

| Sintoma | Solução |
|---|---|
| Celular não aparece | `adb devices`; troque cabo/porta; ver udev no [guia](docs/guia-completo.md) |
| `unauthorized` | Desbloqueie o celular e aceite a depuração USB |
| Build estranho após mudar dependência nativa | `rm -rf android && ./prebuild-android.sh` |
| Cache do Metro | `npx expo start -c` |
| Gradle travado | `npm run gstop` |

Mais casos (assinatura, Play Console, HC-05, BLE, web) no [guia completo](docs/guia-completo.md#troubleshooting).

## Documentação

[docs/guia-completo.md](docs/guia-completo.md) — o README anterior, completo: ambiente por SO, iOS, EAS, Bluetooth em detalhe, troubleshooting.

## Licença

Veja [LICENSE](LICENSE).
