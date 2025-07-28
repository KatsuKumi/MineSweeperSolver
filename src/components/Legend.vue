<template>
  <div class="legend">
    <h3>Cell Types</h3>
    <div class="legend-grid">
      <div class="legend-item">
        <div class="legend-box unrevealed-legend"></div>
        <span>Unrevealed</span>
      </div>
      <div class="legend-item">
        <div class="legend-box empty-legend"></div>
        <span>Empty (0)</span>
      </div>
      <div class="legend-item">
        <div class="legend-box number-legend">1</div>
        <span>Numbers (1-8)</span>
      </div>
      <div class="legend-item">
        <div class="legend-box mine-legend">💣</div>
        <span>Mines</span>
      </div>
      <div class="legend-item">
        <div class="legend-box flag-legend">🚩</div>
        <span>Flags</span>
      </div>
      <div class="legend-item">
        <div class="legend-box safe-legend"></div>
        <span>Safe Move</span>
      </div>
      <div class="legend-item">
        <div class="legend-box mine-move-legend"></div>
        <span>Mine Move</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No logic needed for this static legend component
</script>