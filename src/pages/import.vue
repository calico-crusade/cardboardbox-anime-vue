<template>
<Loading v-if="loading" />
<Error v-else-if="error" :message="error.message" />
<div v-else class="center rounded bg-accent pad flex row import">
    <h2>Don't see your favourite manga? Add it!</h2>
    <div class="control fill">
        <label>Manga URL</label>
        <input type="url" placeholder="Manga Home Page URL" v-model="url" />
    </div>
    <p>We support Manga from the following sites:</p>
    <ul>
        <li><a href="https://mangadex.org" target="_blank">mangadex.org</a></li>
        <li><a href="https://mangaclash.com" target="_blank">mangaclash.com</a></li>
        <li><a href="https://mangakakalot.com" target="_blank">mangakakalot.com</a></li>
        <li><a href="https://ww4.mangakakalot.tv" target="_blank">ww4.mangakakalot.tv</a></li>
        <li><a href="https://nhentai.to" target="_blank">nhentai.to</a> (Yes, really...)</li>
    </ul>
    <footer class="flex">
        <button class="icon-btn pad-left" @click="addManga">
            <Icon>add</Icon>
        </button>
    </footer>
</div>
</template>

<script setup lang="ts">
import { FetchError } from 'ofetch';
const { toPromise } = useApiHelper();
const route = useRoute();

const url = ref('');
const routeUrl = computed(() => decodeURIComponent(route.query.url?.toString() ?? ''));
const loading = ref(false);
const error = ref<undefined | FetchError<any>>();
const { reload } = useMangaApi();

const addManga = async () => {
    loading.value = true;
    const data = await toPromise(reload(url.value, false), true);
    loading.value = false;

    if (data?.manga.id) {
        navigateTo(`/manga/${data.manga.id}`);
    }
};

onMounted(() => nextTick(() => {
    if (!routeUrl.value) return;

    url.value = routeUrl.value;
    addManga();
}));

</script>

<style lang="scss" scoped>
.import {
    p {
        margin-top: 10px;
    }

    a {
        text-decoration: underline;
    }
}
</style>