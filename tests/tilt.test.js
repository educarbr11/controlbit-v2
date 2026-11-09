const test = require('node:test');
const assert = require('node:assert/strict');
const { getTiltDirection } = require('../src/utils/tilt.ts');

// (x, y, isLandscape, current, invertVertical, invertHorizontal)
test('celular parado não gera direção', () => {
  assert.equal(getTiltDirection(0, 0, false, null, false, false), null);
});

test('em retrato, y negativo é frente e y positivo é trás', () => {
  assert.equal(getTiltDirection(0, -0.5, false, null, false, false), 'up');
  assert.equal(getTiltDirection(0, 0.5, false, null, false, false), 'down');
});

test('em retrato, x negativo é direita e x positivo é esquerda', () => {
  assert.equal(getTiltDirection(-0.5, 0, false, null, false, false), 'right');
  assert.equal(getTiltDirection(0.5, 0, false, null, false, false), 'left');
});

test('histerese: entra em 0.35 e só sai abaixo de 0.2', () => {
  assert.equal(getTiltDirection(0, -0.3, false, null, false, false), null);
  assert.equal(getTiltDirection(0, -0.3, false, 'up', false, false), 'up');
  assert.equal(getTiltDirection(0, -0.15, false, 'up', false, false), null);
});

test('inversões trocam o sentido', () => {
  assert.equal(getTiltDirection(0, -0.5, false, null, true, false), 'down');
  assert.equal(getTiltDirection(-0.5, 0, false, null, false, true), 'left');
});
