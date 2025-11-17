<script setup lang="ts">
import { RouterLink } from 'vue-router';

interface ButtonLinkProps {
  href?: string;
  target?: '_self' | '_blank' | '_parent' | '_top';
  rel?: string;
  external?: boolean;
}

const { href, target = '_self', rel, external } = defineProps<ButtonLinkProps>();
</script>

<template>
  <div class="action" style="padding-left: 0; margin-top: 12px">
    <a v-if="external" :href="href" :target="target" :rel="rel">
      <slot />
    </a>
    <RouterLink v-else :to="href || '#'">
      <slot />
    </RouterLink>
  </div>
</template>
