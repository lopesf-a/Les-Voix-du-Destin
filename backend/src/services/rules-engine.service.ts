export type CharacterStats = {
  force?: number;
  dexterite?: number;
  intelligence?: number;
  for?: number;
  dex?: number;
  int?: number;
  [key: string]: unknown;
};

export type RuleActionKind =
  | 'attack'
  | 'defense'
  | 'stealth'
  | 'investigation'
  | 'social'
  | 'healing'
  | 'generic';

export type RuleStat = 'force' | 'dexterite' | 'intelligence';

export type RuleCheckResult = {
  diceExpression: '1d20';
  actionKind: RuleActionKind;
  stat: RuleStat;
  statValue: number;
  modifier: number;
  difficulty: number;
  roll: number;
  total: number;
  success: boolean;
  critical: 'success' | 'failure' | null;
  hpBefore: number;
  hpAfter: number;
  maxHp: number;
  hpDelta: number;
  damageTaken: number;
  healingDone: number;
  xpDelta: number;
  outcomeText: string;
};

type ResolveActionInput = {
  action: string;
  stats: CharacterStats;
  hp: number;
  maxHp: number;
  forcedRoll?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function rollD20(forcedRoll?: number) {
  if (forcedRoll) return clamp(Math.trunc(forcedRoll), 1, 20);
  return Math.floor(Math.random() * 20) + 1;
}

function readStat(stats: CharacterStats, stat: RuleStat) {
  if (stat === 'force') return Number(stats.force ?? stats.for ?? 10);
  if (stat === 'dexterite') return Number(stats.dexterite ?? stats.dex ?? 10);
  return Number(stats.intelligence ?? stats.int ?? 10);
}

function getModifier(statValue: number) {
  return Math.floor((statValue - 10) / 2);
}

function includesOne(action: string, words: string[]) {
  return words.some((word) => action.includes(word));
}

function classifyAction(action: string): { kind: RuleActionKind; stat: RuleStat; difficulty: number } {
  const lower = action
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (includesOne(lower, ['soin', 'soigne', 'potion', 'bandage', 'premier secours', 'guerir'])) {
    return { kind: 'healing', stat: 'intelligence', difficulty: 10 };
  }

  if (includesOne(lower, ['attaque', 'frappe', 'combat', 'epee', 'arme', 'arc', 'tire', 'poignard', 'charge'])) {
    return { kind: 'attack', stat: 'force', difficulty: 12 };
  }

  if (includesOne(lower, ['esquive', 'pare', 'bloque', 'defend', 'defense', 'protege'])) {
    return { kind: 'defense', stat: 'dexterite', difficulty: 11 };
  }

  if (includesOne(lower, ['discret', 'cache', 'faufile', 'infiltre', 'crochete', 'vole', 'saut', 'escalade', 'fuir'])) {
    return { kind: 'stealth', stat: 'dexterite', difficulty: 12 };
  }

  if (includesOne(lower, ['observe', 'inspecte', 'fouille', 'cherche', 'analyse', 'decrypte', 'etudie', 'ecoute'])) {
    return { kind: 'investigation', stat: 'intelligence', difficulty: 11 };
  }

  if (includesOne(lower, ['parle', 'convainc', 'persuade', 'negocie', 'intimide', 'questionne', 'mensonge'])) {
    return { kind: 'social', stat: 'intelligence', difficulty: 11 };
  }

  return { kind: 'generic', stat: 'intelligence', difficulty: 10 };
}

function buildOutcomeText(result: Omit<RuleCheckResult, 'outcomeText'>) {
  const base = `Jet ${result.diceExpression}: ${result.roll} + modificateur ${result.modifier} = ${result.total} contre difficulté ${result.difficulty}.`;
  const status = result.success ? 'Réussite' : 'Échec';
  const critical = result.critical === 'success' ? ' critique' : result.critical === 'failure' ? ' critique' : '';
  const hp = `PV: ${result.hpBefore}/${result.maxHp} → ${result.hpAfter}/${result.maxHp}.`;

  if (result.damageTaken > 0) {
    return `${status}${critical}. ${base} Le personnage subit ${result.damageTaken} dégât(s). ${hp}`;
  }

  if (result.healingDone > 0) {
    return `${status}${critical}. ${base} Le personnage récupère ${result.healingDone} PV. ${hp}`;
  }

  return `${status}${critical}. ${base} Aucun changement de PV. ${hp}`;
}

export function resolvePlayerAction(input: ResolveActionInput): RuleCheckResult {
  const { kind, stat, difficulty } = classifyAction(input.action);
  const statValue = readStat(input.stats, stat);
  const modifier = getModifier(statValue);
  const roll = rollD20(input.forcedRoll);
  const critical: RuleCheckResult['critical'] = roll === 20 ? 'success' : roll === 1 ? 'failure' : null;
  const total = roll + modifier;
  const success = critical === 'success' || (critical !== 'failure' && total >= difficulty);

  let damageTaken = 0;
  let healingDone = 0;
  let xpDelta = 0;

  if (kind === 'healing') {
    if (success) {
      healingDone = clamp(3 + Math.max(modifier, 0), 2, 8);
    }
  } else if (kind === 'attack') {
    if (success) {
      xpDelta = critical === 'success' ? 10 : 5;
    } else {
      damageTaken = clamp(2 + Math.max(difficulty - total, 0), 2, critical === 'failure' ? 10 : 8);
    }
  } else if (kind === 'defense' || kind === 'stealth') {
    if (!success) {
      damageTaken = clamp(1 + Math.max(difficulty - total, 0), 1, critical === 'failure' ? 8 : 5);
    }
  }

  const hpBefore = clamp(input.hp, 0, input.maxHp);
  const hpAfter = clamp(hpBefore - damageTaken + healingDone, 0, input.maxHp);
  const hpDelta = hpAfter - hpBefore;

  const resultWithoutText = {
    diceExpression: '1d20' as const,
    actionKind: kind,
    stat,
    statValue,
    modifier,
    difficulty,
    roll,
    total,
    success,
    critical,
    hpBefore,
    hpAfter,
    maxHp: input.maxHp,
    hpDelta,
    damageTaken,
    healingDone: hpAfter > hpBefore ? hpAfter - hpBefore : 0,
    xpDelta
  };

  return {
    ...resultWithoutText,
    outcomeText: buildOutcomeText(resultWithoutText)
  };
}
