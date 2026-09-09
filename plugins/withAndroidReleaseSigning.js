const { withAppBuildGradle } = require('@expo/config-plugins');

// Todo `expo prebuild` regenera android/app/build.gradle a partir do
// template padrão, que assina o build type `release` com a mesma
// signingConfig do `debug`. Este plugin reaplica a signingConfig de
// release que lê a chave de upload via propriedades Gradle
// (ORG_GRADLE_PROJECT_MYAPP_UPLOAD_*), documentada em
// README.md > "Android — assinatura de produção".
const RELEASE_SIGNING_CONFIG = `
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }`;

function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    if (!contents.includes('MYAPP_UPLOAD_STORE_FILE')) {
      const debugSigningConfigPattern = /(signingConfigs\s*\{\s*debug\s*\{[^}]*\})/;

      if (!debugSigningConfigPattern.test(contents)) {
        throw new Error(
          "withAndroidReleaseSigning: não encontrei o bloco 'signingConfigs { debug { ... } }' em android/app/build.gradle. O template do Expo pode ter mudado — ajuste o plugin em plugins/withAndroidReleaseSigning.js."
        );
      }

      contents = contents.replace(debugSigningConfigPattern, `$1${RELEASE_SIGNING_CONFIG}`);
    }

    const releaseBuildTypePattern =
      /(signingConfig\s+signingConfigs\.)debug(\s*\n\s*(?:def enableShrinkResources|shrinkResources|minifyEnabled))/;

    if (releaseBuildTypePattern.test(contents)) {
      contents = contents.replace(releaseBuildTypePattern, '$1release$2');
    } else if (!contents.includes('signingConfig signingConfigs.release')) {
      throw new Error(
        "withAndroidReleaseSigning: não encontrei 'signingConfig signingConfigs.debug' no buildType 'release' de android/app/build.gradle. O template do Expo pode ter mudado — ajuste o plugin em plugins/withAndroidReleaseSigning.js."
      );
    }

    config.modResults.contents = contents;
    return config;
  });
}

module.exports = withAndroidReleaseSigning;
