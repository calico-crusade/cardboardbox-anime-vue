<template>

</template>

<script setup lang="ts">
    const route = useRoute();
    const _id = route.params.id.toString();
    const _chap = route.params.chapter.toString();
    const _page = route.query.page?.toString() || '1';

    
</script>