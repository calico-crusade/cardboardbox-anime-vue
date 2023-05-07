<template>
    <Error v-if="failureReason" :message="failureReason" />
    <Loading v-else />
</template>

<script setup lang="ts">
const route = useRoute();
const { failureReason, resolve } = useAuthApi();
const code = computed(() => route.query.code?.toString());
const redirect = computed(() => route.query.return?.toString() ?? '/account');

useHead({ title: 'Logging you into something really fancy!' });

onMounted(() => nextTick(async () => {
    const result = await resolve(code.value);
    if (!result) return;

    navigateTo(redirect.value || '/');
}));
</script>