<template>
    <Error v-if="error" :message="error" />
    <Loading v-else />
</template>

<script setup lang="ts">
    const code = useRoute().query.code?.toString();
    const error = authApi.failureReason;

    useHead({ title: 'Logging you into something really fancy!' });

    onMounted(() => nextTick(async () => {
        const result = await authApi.resolve(code);
        if (result) return;

        await navigateTo(api.redirect || '/');
    }));
</script>