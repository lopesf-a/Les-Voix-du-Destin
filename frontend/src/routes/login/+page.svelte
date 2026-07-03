<script lang="ts">
  import { apiFetch } from '$lib/api';
  import { saveAuth } from '$lib/auth';
  import type { User } from '$lib/types';

  let email = $state('player@example.com');
  let password = $state('password123');
  let pseudo = $state('Aventurier');
  let mode = $state<'login' | 'register'>('login');
  let loading = $state(false);
  let error = $state('');

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    void submit();
  }

  function toggleMode() {
    mode = mode === 'login' ? 'register' : 'login';
  }

  async function submit() {
    loading = true;
    error = '';

    try {
      const payload = mode === 'login'
        ? { email, password }
        : { email, password, pseudo };

      const response = await apiFetch<{ user: User; token: string }>(`/auth/${mode}`, {
        method: 'POST',
        auth: false,
        body: JSON.stringify(payload)
      });

      saveAuth(response.token, response.user);
      window.location.href = '/dashboard';
    } catch (err) {
      error = err instanceof Error ? err.message : 'Erreur inconnue';
    } finally {
      loading = false;
    }
  }
</script>

<section class="auth-layout">
  <form class="auth-card" onsubmit={handleSubmit}>
    <p class="eyebrow">Compte de démonstration</p>
    <h1>{mode === 'login' ? 'Connexion' : 'Inscription'}</h1>

    {#if mode === 'register'}
      <label>
        Pseudo
        <input bind:value={pseudo} placeholder="Votre pseudo" />
      </label>
    {/if}

    <label>
      Email
      <input type="email" bind:value={email} />
    </label>

    <label>
      Mot de passe
      <input type="password" bind:value={password} />
    </label>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    <button class="primary" type="submit" disabled={loading}>
      {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
    </button>

    <button class="ghost" type="button" onclick={toggleMode}>
      {mode === 'login' ? 'Créer un compte' : 'J’ai déjà un compte'}
    </button>
  </form>
</section>
