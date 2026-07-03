import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePlayerAction } from './rules-engine.service.js';

const baseStats = {
  force: 10,
  dexterite: 10,
  intelligence: 10
};

test('un jet forcé à 5 produit un échec sur une attaque standard', () => {
  const result = resolvePlayerAction({
    action: 'J’attaque le gobelin avec mon épée',
    stats: baseStats,
    hp: 20,
    maxHp: 20,
    forcedRoll: 5
  });

  assert.equal(result.roll, 5);
  assert.equal(result.actionKind, 'attack');
  assert.equal(result.success, false);
  assert.equal(result.hpAfter < result.hpBefore, true);
});

test('un jet forcé à 20 produit une réussite critique', () => {
  const result = resolvePlayerAction({
    action: 'J’attaque le gobelin avec mon épée',
    stats: baseStats,
    hp: 20,
    maxHp: 20,
    forcedRoll: 20
  });

  assert.equal(result.roll, 20);
  assert.equal(result.success, true);
  assert.equal(result.critical, 'success');
  assert.equal(result.xpDelta, 10);
});

test('un jet forcé à 1 produit un échec critique', () => {
  const result = resolvePlayerAction({
    action: 'Je tente de me défendre',
    stats: baseStats,
    hp: 20,
    maxHp: 20,
    forcedRoll: 1
  });

  assert.equal(result.roll, 1);
  assert.equal(result.success, false);
  assert.equal(result.critical, 'failure');
  assert.equal(result.damageTaken > 0, true);
});

test('un soin réussi ne dépasse jamais les PV maximum', () => {
  const result = resolvePlayerAction({
    action: 'Je bois une potion pour me soigner',
    stats: { ...baseStats, intelligence: 18 },
    hp: 18,
    maxHp: 20,
    forcedRoll: 20
  });

  assert.equal(result.actionKind, 'healing');
  assert.equal(result.success, true);
  assert.equal(result.hpAfter, 20);
  assert.equal(result.hpAfter <= result.maxHp, true);
});

test('une action non reconnue reste une action générique', () => {
  const result = resolvePlayerAction({
    action: 'J’attends quelques secondes pour réfléchir',
    stats: baseStats,
    hp: 20,
    maxHp: 20,
    forcedRoll: 10
  });

  assert.equal(result.actionKind, 'generic');
  assert.equal(result.stat, 'intelligence');
  assert.equal(result.damageTaken, 0);
  assert.equal(result.healingDone, 0);
});
