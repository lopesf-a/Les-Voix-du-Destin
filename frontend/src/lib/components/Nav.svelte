<script lang="ts">
  import { getStoredUser, logout } from '$lib/auth';

  let user = $state<ReturnType<typeof getStoredUser>>(null);

  $effect(() => {
    user = getStoredUser();
  });
</script>

<nav class="nav">
  <a class="brand" href="/">🎲 Les Voix du Destin</a>
  <div class="links">
    <a href="/dashboard">Dashboard</a>
    <a href="/characters">Personnages</a>
    <a href="/game">Jouer</a>
    <a href="/history">Historique</a>
    <a href="/rules">Règles</a>
  </div>
  <div class="user-zone">
    {#if user}
      <span>{user.pseudo}</span>
      <button onclick={logout}>Déconnexion</button>
    {:else}
      <a class="button-link" href="/login">Connexion</a>
    {/if}
  </div>
</nav>
