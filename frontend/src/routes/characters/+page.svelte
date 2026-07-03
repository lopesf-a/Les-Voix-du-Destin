<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import { apiFetch } from '$lib/api';
  import type { Character } from '$lib/types';

  let characters = $state<Character[]>([]);
  let loading = $state(true);
  let error = $state('');

  let name = $state('Nouveau héros');
  let className = $state('Guerrier');
  let force = $state(10);
  let dexterite = $state(10);
  let intelligence = $state(10);
  let backstory = $state('');

  $effect(() => {
    loadCharacters();
  });

  async function loadCharacters() {
    loading = true;
    try {
      const response = await apiFetch<{ characters: Character[] }>('/characters');
      characters = response.characters;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Erreur inconnue';
    } finally {
      loading = false;
    }
  }

  function handleCreateCharacterSubmit(event: SubmitEvent) {
    event.preventDefault();
    void createCharacter();
  }

  async function createCharacter() {
    error = '';
    try {
      await apiFetch('/characters', {
        method: 'POST',
        body: JSON.stringify({
          name,
          className,
          stats: { force, dexterite, intelligence },
          inventory: ['Épée', 'Potion'],
          backstory
        })
      });
      await loadCharacters();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Erreur inconnue';
    }
  }
</script>

<div class="page-title">
  <p class="eyebrow">Création personnage</p>
  <h1>Personnages</h1>
</div>

<section class="grid-2">
  <Card title="Nouveau personnage" subtitle="Stats simples pour MVP">
    <form class="stack" onsubmit={handleCreateCharacterSubmit}>
      <label>Nom <input bind:value={name} /></label>
      <label>Classe <input bind:value={className} /></label>
      <div class="form-grid">
        <label>Force <input type="number" min="1" max="20" bind:value={force} /></label>
        <label>Dextérité <input type="number" min="1" max="20" bind:value={dexterite} /></label>
        <label>Intelligence <input type="number" min="1" max="20" bind:value={intelligence} /></label>
      </div>
      <label>Backstory <textarea rows="4" bind:value={backstory}></textarea></label>
      <button class="primary" type="submit">Créer</button>
      {#if error}<p class="error">{error}</p>{/if}
    </form>
  </Card>

  <Card title="Mes personnages" subtitle="Personnages sauvegardés">
    {#if loading}
      <p>Chargement...</p>
    {:else if characters.length === 0}
      <p>Aucun personnage.</p>
    {:else}
      <ul class="cards-list">
        {#each characters as character}
          <li>
            <strong>{character.name}</strong>
            <span>{character.className} · PV {character.hp}/{character.maxHp} · XP {character.xp}</span>
            <small>FOR {character.stats.force} · DEX {character.stats.dexterite} · INT {character.stats.intelligence}</small>
          </li>
        {/each}
      </ul>
    {/if}
  </Card>
</section>
