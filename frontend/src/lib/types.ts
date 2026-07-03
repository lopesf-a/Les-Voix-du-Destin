export type User = {
  id: string;
  email: string;
  pseudo: string;
  role: 'PLAYER' | 'ADMIN';
  createdAt: string;
};

export type Character = {
  id: string;
  name: string;
  className: string;
  level: number;
  hp: number;
  maxHp: number;
  xp: number;
  stats: {
    force: number;
    dexterite: number;
    intelligence: number;
  };
  inventory: string[];
  backstory?: string;
};

export type Scenario = {
  id: string;
  title: string;
  summary: string;
  universe: string;
  difficulty: string;
};

export type GameSession = {
  id: string;
  title: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  character: Character;
  scenario?: Scenario | null;
  _count?: { messages: number };
};

export type RuleCheck = {
  diceExpression: '1d20';
  actionKind: 'attack' | 'defense' | 'stealth' | 'investigation' | 'social' | 'healing' | 'generic';
  stat: 'force' | 'dexterite' | 'intelligence';
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

export type GameMessage = {
  id: string;
  sessionId: string;
  role: 'PLAYER' | 'MJ' | 'SYSTEM';
  content: string;
  createdAt: string;
  metadata?: {
    ruleCheck?: RuleCheck;
    [key: string]: unknown;
  } | null;
};

export type Rule = {
  id: string;
  title: string;
  category: string;
  content: string;
};

export type Overview = {
  characters: number;
  sessions: number;
  messages: number;
  aiCalls: number;
  failedAiCalls: number;
  totalTokens: number;
  averageLatencyMs: number;
};
