<template>
    <Loading v-if="pending" />
    <div class="page-wrapper" v-else>
        {{ pageUrl }}
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'nohead' });

const { proxy } = useApiHelper();
const { token } = useAppSettings();

const {
    pending,
    external,
    manga,
    chapters,
    chapter,
    pageUrl,
    title,
    nextPageImage,
    chapterIndex,
    hasNextChapter,
    hasNextPage,
    hasPreviousPage,
    hasPreviousChapter,

    doSetup,
    fetch
} = usePageService();

const route = useRoute();

useHead({ title });
useServerSeoMeta({
    title,
    ogTitle: title,
    description: manga.value?.description,
    ogDescription: manga.value?.description,
    ogImage: proxy(manga.value?.cover || ''),
    twitterCard: 'summary_large_image'
});

await doSetup();

onMounted(async () => await nextTick(async () => {
    if (!token.value) return;
    //Refetch with authentication context
    await fetch(true);
}));

watch(() => route.query, () => fetch(true));
</script>