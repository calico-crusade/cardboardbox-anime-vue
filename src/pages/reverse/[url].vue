<template>
<div class="reverse-wrapper">
    <ReverseSearch
        v-model="search"
        @file="searchFile"
    />
    <Loading v-if="pending" inline />
    <Card v-for="result of combined" :search="result" />
    <div class="alert center flex center-items" v-if="results && combined.length === 0">
        <img src="/twirl.gif" />
        <p>No results!</p>
    </div>
</div>
</template>

<script setup lang="ts">
const route = useRoute();
const { reverseFile, reverseUrl } = useMangaApi();
const { toPromise, proxy } = useApiHelper();

const url = computed(() => decodeURIComponent(route.params.url?.toString() ?? ''));
const search = ref(url.value);
const { pending, data: results } = await reverseUrl(url.value);
const combined = computed(() => results.value ? [...results.value.match, ...results.value.vision, ...results.value.textual] : []);
const first = computed(() => combined.value[0]);

const title = computed(() => first.value?.manga?.title ?? 'Reverse Image Search');
const description = computed(() => first.value?.manga.description ?? 'Reverse Image search Manga pages to find the manga source.');
const cover = computed(() => first.value?.manga.cover ? proxy(first.value.manga.cover, 'manga-cover') : 'https://manga.index-0.com/logo.png');

const searchFile = async (file: File) => {
    results.value = null;
    pending.value = true;
    results.value = (await toPromise(reverseFile(file), true)) ?? null;
    pending.value = false;
}

useHead({ title });

useServerSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description,
    ogImage: cover,
    twitterCard: 'summary_large_image'
});
</script>