<template>
    <Loading v-if="pending" />
    <div class="page-wrapper" v-else>
        {{ pageUrl }}
    </div>
</template>

<script setup lang="ts">
    import { PageService } from '~/utils/page-services/page.service';

    definePageMeta({ layout: 'nohead' });

    const route = useRoute();
    const _instance = new PageService(route);

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
        hasPreviousChapter
    } = _instance;

    const proxy = (url?: string) => _instance.proxy(url);

    useHead({ title });
    useServerSeoMeta({
        title,
        ogTitle: title,
        description: manga.value?.description,
        ogDescription: manga.value?.description,
        ogImage: proxy(manga.value?.cover || ''),
        twitterCard: 'summary_large_image'
    });

    await _instance.onSetup();

    onMounted(async () => await nextTick(async () => {
        if (!api.token) return;
        //Refetch with authentication context
        await _instance.fetch(true);
    }));

    watch(() => route.query, () => _instance.fetch(true));
</script>