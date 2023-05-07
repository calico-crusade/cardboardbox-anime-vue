<template>
<div class="fill-parent flex row pad">
    <ReverseSearch 
        v-model="search"
        @file="searchFile"
    />
    <Loading v-if="pending" />
    <Card v-for="result of combined" :search="result" />
    <div class="alert center flex center-items" v-if="results && combined.length === 0">
        <img src="/twirl.gif" />
        <p>No results!</p>
    </div>
</div>
</template>

<script setup lang="ts">
import { ImageSearch } from '~/models';

const { reverseFile } = useMangaApi();
const { toPromise } = useApiHelper();
const search = ref('');
const pending = ref(false);
const results = ref<ImageSearch | undefined>();
const combined = computed(() => results.value ? [...results.value.match, ...results.value.vision, ...results.value.textual] : []);

const searchFile = async (file: File) => {
    results.value = undefined;
    pending.value = true;
    results.value = await toPromise(reverseFile(file), true);
    pending.value = false;
};
const title = 'Reverse Image Search', description = 'Reverse Image search Manga pages to find the manga source.', image = 'https://manga.index-0.com/logo.png';

useHead({ title });

useServerSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description,
    ogImage: image,
    twitterCard: 'summary_large_image'
});
</script>