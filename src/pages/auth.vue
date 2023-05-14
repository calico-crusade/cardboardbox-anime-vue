<template>
    <Error v-if="failureReason" :message="failureReason" />
    <Loading v-else />
</template>

<script setup lang="ts">
const route = useRoute();
const { failureReason, resolve } = useAuthApi();
const { injectSettings } = useAppSettings();
const code = computed(() => route.query.code?.toString());
const redirect = computed(() => route.query.return?.toString() ?? '/account');

useHead({ title: 'Logging you into something really fancy!' });

onMounted(() => nextTick(() => setTimeout(async () => {
    const result = await resolve(code.value);
    if (!result) return;

    injectSettings();
    navigateTo(redirect.value || '/');
}, 300)));
</script>