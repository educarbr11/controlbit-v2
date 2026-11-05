// Deixa o `node --test` carregar os .ts do app sem instalar nada: transpila com o
// typescript do projeto e troca o AsyncStorage por um falso em memória.
const fs = require('fs');
const Module = require('module');
const ts = require('typescript');

global.fakeStore = {};
const fakeAsyncStorage = {
  getItem: async (k) => (k in global.fakeStore ? global.fakeStore[k] : null),
  setItem: async (k, v) => { global.fakeStore[k] = v; },
};

const load = Module._load;
Module._load = function (request, ...rest) {
  if (request === '@react-native-async-storage/async-storage') {
    return { __esModule: true, default: fakeAsyncStorage };
  }
  return load.call(this, request, ...rest);
};

require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: 'commonjs', target: 'es2020', esModuleInterop: true },
  });
  module._compile(outputText, filename);
};
