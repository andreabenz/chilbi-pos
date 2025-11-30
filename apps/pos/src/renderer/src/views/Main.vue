<script setup lang="ts">
import { Splitter, SplitterPanel } from 'primevue';
</script>

<template>
  <Splitter class="h-full">
    <SplitterPanel> Main Screen with categories and items </SplitterPanel>
    <SplitterPanel :size="25" :min-size="25"> Receipt and checkout </SplitterPanel>
  </Splitter>
</template>
