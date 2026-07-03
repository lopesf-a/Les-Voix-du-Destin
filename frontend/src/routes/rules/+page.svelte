<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import { apiFetch } from '$lib/api';
  import type { Rule, Scenario } from '$lib/types';

  let rules = $state<Rule[]>([]);
  let scenarios = $state<Scenario[]>([]);
  let error = $state('');

  $effect(() => {
    Promise.all([
      apiFetch<{ rules: Rule[] }>('/rules'),
      apiFetch<{ scenarios: Scenario[] }>('/scenarios')
    ])
      .then(([rulesRes, scenariosRes]) => {
        rules = rulesRes.rules;
        scenarios = scenariosRes.scenarios;
      })
      .catch((err) => error = err instanceof Error ? err.message : 'Erreur inconnue');
  });
</script>

<div class="page-title">
  <p class="eyebrow">Contenu métier</p>
  <h1>Règles & scénarios</h1>
</div>

{#if error}<p class="error">{error}</p>{/if}

<section class="grid-2 align-start">
  <Card title="Règles métier" subtitle="Base de connaissance MVP">
    <ul class="cards-list">
      {#each rules as rule}
        <li>
          <strong>{rule.title}</strong>
          <span>{rule.category}</span>
          <small>{rule.content}</small>
        </li>
      {/each}
    </ul>
  </Card>

  <Card title="Scénarios" subtitle="Univers de démonstration">
    <ul class="cards-list">
      {#each scenarios as scenario}
        <li>
          <strong>{scenario.title}</strong>
          <span>{scenario.universe} · {scenario.difficulty}</span>
          <small>{scenario.summary}</small>
        </li>
      {/each}
    </ul>
  </Card>
</section>
