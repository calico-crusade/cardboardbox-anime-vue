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

const url = ref('');
const loading = ref(false);
const error = ref<undefined | FetchError<any>>();
const { reload } = useMangaApi();

const addManga = async () => {
    loading.value = true;
    const { data, error: reloadError } = await reload(url.value, false);
    error.value = reloadError.value ?? undefined;
    loading.value = false;

    if (data.value?.manga.id) {
        await navigateTo(`/manga/${data.value.manga.id}`);
    }
};

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