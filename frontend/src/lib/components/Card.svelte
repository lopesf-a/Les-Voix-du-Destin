<script lang="ts">
  export let title: string;
  export let subtitle = '';
</script>

<section class="card">
  <div class="card-header">
    <h2>{title}</h2>
    {#if subtitle}
      <p>{subtitle}</p>
    {/if}
  </div>
  <slot />
</section>
