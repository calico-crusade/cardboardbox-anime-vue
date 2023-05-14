<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { fixBgImage, injectSettings } = useAppSettings();
const { bump } = useAuthApi();
onMounted(() => nextTick(async () => {
    fixBgImage();

    if (await bump()) injectSettings();
}));
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