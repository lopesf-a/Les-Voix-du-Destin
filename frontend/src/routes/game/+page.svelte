<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import { apiFetch, streamApiEvents } from '$lib/api';
  import type { Character, GameMessage, GameSession, RuleCheck, Scenario } from '$lib/types';

  let characters = $state<Character[]>([]);
  let scenarios = $state<Scenario[]>([]);
  let sessions = $state<GameSession[]>([]);
  let selectedCharacterId = $state('');
  let selectedScenarioId = $state('');
  let selectedSessionId = $state('');
  let messages = $state<GameMessage[]>([]);
  let activeCharacter = $state<Character | null>(null);
  let currentRuleCheck = $state<RuleCheck | null>(null);
  let title = $state('Nouvelle aventure');
  let action = $state('J’observe la taverne et les personnes autour de moi.');
  let forcedRollInput = $state('');
  let loading = $state(false);
  let error = $state('');

  $effect(() => {
    loadInitialData();
  });

  function statLabel(stat: RuleCheck['stat']) {
    if (stat === 'force') return 'Force';
    if (stat === 'dexterite') return 'Dextérité';
    return 'Intelligence';
  }

  function updateActiveCharacterFromSession() {
    const session = sessions.find((item) => item.id === selectedSessionId);
    activeCharacter = session?.character ?? characters.find((item) => item.id === selectedCharacterId) ?? null;
  }

  async function loadInitialData() {
    try {
      const [charactersRes, scenariosRes, sessionsRes] = await Promise.all([
        apiFetch<{ characters: Character[] }>('/characters'),
        apiFetch<{ scenarios: Scenario[] }>('/scenarios'),
        apiFetch<{ sessions: GameSession[] }>('/sessions')
      ]);

      characters = charactersRes.characters;
      scenarios = scenariosRes.scenarios;
      sessions = sessionsRes.sessions;

      if (!selectedCharacterId) selectedCharacterId = characters[0]?.id ?? '';
      if (!selectedScenarioId) selectedScenarioId = scenarios[0]?.id ?? '';
      if (!selectedSessionId) selectedSessionId = sessions[0]?.id ?? '';

      updateActiveCharacterFromSession();
      if (selectedSessionId) await loadMessages(selectedSessionId);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Erreur inconnue';
    }
  }

  async function refreshSideData() {
    const [charactersRes, sessionsRes] = await Promise.all([
      apiFetch<{ characters: Character[] }>('/characters'),
      apiFetch<{ sessions: GameSession[] }>('/sessions')
    ]);

    characters = charactersRes.characters;
    sessions = sessionsRes.sessions;
    updateActiveCharacterFromSession();
  }

  async function loadMessages(sessionId: string) {
    const response = await apiFetch<{ messages: GameMessage[] }>(`/sessions/${sessionId}/messages`);
    messages = response.messages;
    const lastRuleCheck = [...messages].reverse().find((message) => message.metadata?.ruleCheck)?.metadata?.ruleCheck;
    currentRuleCheck = lastRuleCheck ?? currentRuleCheck;
  }

  async function handleSessionChange() {
    updateActiveCharacterFromSession();
    currentRuleCheck = null;
    if (selectedSessionId) await loadMessages(selectedSessionId);
  }

  async function createSession() {
    loading = true;
    error = '';
    try {
      const response = await apiFetch<{ session: GameSession }>('/sessions', {
        method: 'POST',
        body: JSON.stringify({
          characterId: selectedCharacterId,
          scenarioId: selectedScenarioId || undefined,
          title
        })
      });
      selectedSessionId = response.session.id;
      await loadInitialData();
      await loadMessages(response.session.id);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Erreur inconnue';
    } finally {
      loading = false;
    }
  }

  function replaceMessage(messageId: string, nextMessage: GameMessage) {
    messages = messages.map((message) => (message.id === messageId ? nextMessage : message));
  }

  function appendToMessage(messageId: string, chunk: string) {
    messages = messages.map((message) =>
      message.id === messageId ? { ...message, content: `${message.content}${chunk}` } : message
    );
  }

  async function sendAction() {
    const trimmedAction = action.trim();
    if (!selectedSessionId || !trimmedAction) return;

    const localPlayerId = `local-player-${Date.now()}`;
    const localMjId = `local-mj-${Date.now()}`;
    const forcedRoll = forcedRollInput.trim() ? Number(forcedRollInput) : undefined;

    loading = true;
    error = '';
    currentRuleCheck = null;
    action = '';

    messages = [
      ...messages,
      {
        id: localPlayerId,
        sessionId: selectedSessionId,
        role: 'PLAYER',
        content: trimmedAction,
        createdAt: new Date().toISOString()
      },
      {
        id: localMjId,
        sessionId: selectedSessionId,
        role: 'MJ',
        content: '',
        createdAt: new Date().toISOString()
      }
    ];

    try {
      let streamedError = '';

      await streamApiEvents(
        '/ai/turn/stream',
        {
          method: 'POST',
          body: JSON.stringify({
            sessionId: selectedSessionId,
            action: trimmedAction,
            forcedRoll
          })
        },
        async ({ event, data }) => {
          if (event === 'meta') {
            const payload = data as {
              playerMessage: GameMessage;
              ruleCheck: RuleCheck;
              character: Character;
            };
            replaceMessage(localPlayerId, payload.playerMessage);
            currentRuleCheck = payload.ruleCheck;
            activeCharacter = payload.character;
          }

          if (event === 'delta') {
            const payload = data as { content: string };
            appendToMessage(localMjId, payload.content);
          }

          if (event === 'done') {
            const payload = data as {
              message: GameMessage;
              ruleCheck: RuleCheck;
              character: Character;
            };
            replaceMessage(localMjId, payload.message);
            currentRuleCheck = payload.ruleCheck;
            activeCharacter = payload.character;
          }

          if (event === 'error') {
            const payload = data as { message?: string };
            streamedError = payload.message ?? 'Erreur pendant le streaming.';
          }
        }
      );

      if (streamedError) throw new Error(streamedError);

      await refreshSideData();
      await loadMessages(selectedSessionId);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Erreur inconnue';
      messages = messages.filter((message) => message.id !== localMjId || message.content.trim().length > 0);
    } finally {
      loading = false;
    }
  }
</script>

<div class="page-title">
  <p class="eyebrow">Partie JDR</p>
  <h1>Jouer avec le MJ IA</h1>
</div>

<section class="grid-2 align-start">
  <Card title="Lancer une session" subtitle="Choisir personnage et scénario">
    <form class="stack" on:submit|preventDefault={createSession}>
      <label>
        Titre
        <input bind:value={title} />
      </label>
      <label>
        Personnage
        <select bind:value={selectedCharacterId} on:change={updateActiveCharacterFromSession}>
          {#each characters as character}
            <option value={character.id}>{character.name} — {character.className}</option>
          {/each}
        </select>
      </label>
      <label>
        Scénario
        <select bind:value={selectedScenarioId}>
          {#each scenarios as scenario}
            <option value={scenario.id}>{scenario.title}</option>
          {/each}
        </select>
      </label>
      <button class="primary" disabled={loading || !selectedCharacterId}>Créer la session</button>
    </form>

    <hr />

    <label>
      Session active
      <select bind:value={selectedSessionId} on:change={handleSessionChange}>
        {#each sessions as session}
          <option value={session.id}>{session.title}</option>
        {/each}
      </select>
    </label>

    {#if activeCharacter}
      <div class="character-status">
        <div>
          <strong>{activeCharacter.name}</strong>
          <span>{activeCharacter.className} · niveau {activeCharacter.level}</span>
        </div>
        <div class="hp-bar" aria-label="PV du personnage">
          <span style={`width: ${(activeCharacter.hp / activeCharacter.maxHp) * 100}%`}></span>
        </div>
        <p>{activeCharacter.hp}/{activeCharacter.maxHp} PV · {activeCharacter.xp} XP</p>
      </div>
    {/if}
  </Card>

  <Card title="Table de jeu" subtitle="Streaming IA + dés + PV côté serveur">
    {#if error}<p class="error">{error}</p>{/if}

    {#if currentRuleCheck}
      <aside class:success={currentRuleCheck.success} class:failure={!currentRuleCheck.success} class="rule-check">
        <strong>{currentRuleCheck.success ? 'Réussite' : 'Échec'} du test</strong>
        <p>
          {statLabel(currentRuleCheck.stat)} · {currentRuleCheck.diceExpression} :
          {currentRuleCheck.roll} + {currentRuleCheck.modifier} = {currentRuleCheck.total}
          contre difficulté {currentRuleCheck.difficulty}
        </p>
        <p>{currentRuleCheck.outcomeText}</p>
      </aside>
    {/if}

    <div class="messages">
      {#each messages as message}
        <article class:player={message.role === 'PLAYER'} class:mj={message.role === 'MJ'}>
          <strong>{message.role}</strong>
          <p>{message.content || (loading && message.role === 'MJ' ? 'Le MJ commence à écrire...' : '')}</p>
          {#if message.metadata?.ruleCheck}
            <small class="message-rule">{message.metadata.ruleCheck.outcomeText}</small>
          {/if}
        </article>
      {/each}
    </div>

    <form class="stack" on:submit|preventDefault={sendAction}>
      <label>
        Action du joueur
        <textarea rows="4" bind:value={action}></textarea>
      </label>
      <label>
        Jet forcé pour test local facultatif
        <input min="1" max="20" placeholder="ex: 5 pour tester un mauvais jet" type="number" bind:value={forcedRollInput} />
      </label>
      <button class="primary" disabled={loading || !selectedSessionId}>
        {loading ? 'Le MJ écrit en streaming...' : 'Envoyer au MJ IA'}
      </button>
    </form>
  </Card>
</section>
