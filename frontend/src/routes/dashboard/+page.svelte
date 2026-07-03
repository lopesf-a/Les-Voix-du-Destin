<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import { apiFetch } from '$lib/api';
  import type { Character, GameSession, Overview } from '$lib/types';

  let overview = $state<Overview | null>(null);
  let characters = $state<Character[]>([]);
  let sessions = $state<GameSession[]>([]);
  let loading = $state(true);
  let error = $state('');

  $effect(() => {
    loadDashboard();
  });

  async function loadDashboard() {
    loading = true;
    error = '';

    try {
      const [metricsRes, charactersRes, sessionsRes] = await Promise.all([
        apiFetch<{ overview: Overview }>('/metrics/overview'),
        apiFetch<{ characters: Character[] }>('/characters'),
        apiFetch<{ sessions: GameSession[] }>('/sessions')
      ]);

      overview = metricsRes.overview;
      characters = charactersRes.characters;
      sessions = sessionsRes.sessions;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Erreur inconnue';
    } finally {
      loading = false;
    }
  }
</script>

<div class="page-title">
  <p class="eyebrow">Pilotage MVP</p>
  <h1>Dashboard</h1>
  <p>Suivi des personnages, sessions, messages et appels IA.</p>
</div>

{#if loading}
  <p>Chargement du dashboard...</p>
{:else if error}
  <p class="error">{error}</p>
{:else}
  <section class="stats-grid">
    <div><strong>{overview?.characters ?? 0}</strong><span>Personnages</span></div>
    <div><strong>{overview?.sessions ?? 0}</strong><span>Sessions</span></div>
    <div><strong>{overview?.messages ?? 0}</strong><span>Messages</span></div>
    <div><strong>{overview?.aiCalls ?? 0}</strong><span>Appels IA</span></div>
    <div><strong>{overview?.totalTokens ?? 0}</strong><span>Tokens</span></div>
    <div><strong>{overview?.averageLatencyMs ?? 0} ms</strong><span>Latence moyenne</span></div>
  </section>

  <section class="grid-2">
    <Card title="Derniers personnages" subtitle="Création et progression">
      {#if characters.length === 0}
        <p>Aucun personnage.</p>
      {:else}
        <ul class="list">
          {#each characters.slice(0, 4) as character}
            <li>
              <strong>{character.name}</strong>
              <span>{character.className} · niveau {character.level}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </Card>

    <Card title="Sessions récentes" subtitle="Historique de jeu">
      {#if sessions.length === 0}
        <p>Aucune session.</p>
      {:else}
        <ul class="list">
          {#each sessions.slice(0, 4) as session}
            <li>
              <strong>{session.title}</strong>
              <span>{session.character.name} · {session._count?.messages ?? 0} messages</span>
            </li>
          {/each}
        </ul>
      {/if}
    </Card>
  </section>
{/if}
