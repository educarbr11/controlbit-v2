const test = require('node:test');
const assert = require('node:assert/strict');
const { CommandStorage } = require('../src/services/storage.ts');

test.beforeEach(() => { global.fakeStore = {}; });

const edited = [{ id: 'b1', icon: 'zap', command: 'EDITED', label: 'x' }];
const car = async () => (await CommandStorage.getProfiles()).find((p) => p.id === 'preset_car');

test('criar perfil não apaga os botões editados do perfil padrão', async () => {
  await CommandStorage.saveButtonsToActiveProfile(edited);
  await CommandStorage.createProfile('Novo');
  assert.equal((await car()).buttons[0].command, 'EDITED');
});

test('renomear e apagar perfil também preservam o perfil padrão editado', async () => {
  await CommandStorage.saveButtonsToActiveProfile(edited);
  const a = await CommandStorage.createProfile('A');
  await new Promise((r) => setTimeout(r, 5)); // o id usa Date.now()
  const b = await CommandStorage.createProfile('B');
  await CommandStorage.renameProfile(a.id, 'A2');
  await CommandStorage.deleteProfile(b.id);
  assert.equal((await car()).buttons[0].command, 'EDITED');
  const names = (await CommandStorage.getProfiles()).map((p) => p.name);
  assert.ok(names.includes('A2'));
  assert.ok(!names.includes('B'));
});

test('perfil novo vira o perfil ativo', async () => {
  const p = await CommandStorage.createProfile('Novo');
  assert.equal((await CommandStorage.getActiveProfile()).id, p.id);
});

test('perfis padrão não podem ser apagados', async () => {
  await CommandStorage.deleteProfile('preset_car');
  assert.ok(await car());
});
