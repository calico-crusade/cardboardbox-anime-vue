<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { fixBgImage } = useAppSettings();
onMounted(() => fixBgImage());
</script>

<style lang="scss">
.page-enter-active,
.page-leave-active {
    transition: all 150ms;
}
.page-enter-from,
.page-leave-to {
    opacity: 0;
    filter: blur(1rem);
}
</style>