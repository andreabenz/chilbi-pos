<script setup lang="ts">
import ButtonLink from '@/components/ButtonLink.vue';
import Versions from '@/components/Versions.vue';

const ipcHandle = () => window.api.ping();
</script>

<template>
  <img alt="logo" class="logo" src="@/assets/electron.svg" />
  <div class="creator">Powered by electron-vite</div>
  <div class="text">
    Build an Electron app with
    <span class="vue">Vue</span>
    and
    <span class="ts">TypeScript</span>
  </div>
  <p class="tip">Please try pressing <code>F12</code> to open the devTool</p>
  <div class="actions">
    <ButtonLink href="https://electron-vite.org/" target="_blank" rel="noreferrer" :external="true"
      >Documentationf</ButtonLink
    >
    <ButtonLink target="_blank" rel="noreferrer" @click="ipcHandle"> Send IPC </ButtonLink>

    <ButtonLink href="/example">Example page</ButtonLink>
  </div>
  <Versions />
</template>
