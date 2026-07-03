<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import { apiFetch } from '$lib/api';
  import type { GameSession } from '$lib/types';

  let sessions = $state<GameSession[]>([]);
  let error = $state('');

  $effect(() => {
    apiFetch<{ sessions: GameSession[] }>('/sessions')
      .then((response) => sessions = response.sessions)
      .catch((err) => error = err instanceof Error ? err.message : 'Erreur inconnue');
  });
</script>

<div class="page-title">
  <p class="eyebrow">Historique</p>
  <h1>Sessions sauvegardées</h1>
</div>

<Card title="Historique des parties" subtitle="Reprise de session et suivi narratif">
  {#if error}<p class="error">{error}</p>{/if}
  <ul class="cards-list">
    {#each sessions as session}
      <li>
        <strong>{session.title}</strong>
        <span>{session.character.name} · {session.scenario?.title ?? 'Scénario libre'}</span>
        <small>{session._count?.messages ?? 0} messages · statut {session.status}</small>
      </li>
    {/each}
  </ul>
</Card>
