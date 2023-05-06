<template>
    <Error v-if="error" :message="error" />
    <Loading v-else />
</template>

<script setup lang="ts">
const { failureReason, resolve } = useAuthApi();
const { redirect  } = useAppSettings();
const code = useRoute().query.code?.toString();
const error = failureReason;

useHead({ title: 'Logging you into something really fancy!' });

onMounted(() => nextTick(async () => {
    const result = await resolve(code);
    if (result) return;

    navigateTo(redirect.value || '/');
}));
</script>