<script lang="ts">
  import '../styles/app.css';
  import Nav from '$lib/components/Nav.svelte';
</script>

<Nav />
<main class="page-shell">
  <slot />
</main>
