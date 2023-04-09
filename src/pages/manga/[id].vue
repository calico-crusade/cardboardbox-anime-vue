<template>
    <Loading v-if="pending" />
    <Error v-else-if="!data || !manga" />
    <div class="flex row fill-parent scroll-y" v-else>
        <header class="flex">
            <div class="image" :style="{ 'background-image': 'url(' + manga.cover + ')' }"></div>
            <article class="flex row">
                <a class="title" :href="manga.url" target="_blank">{{ manga.title }}</a>
                <Markdown v-if="manga.description" :content="manga.description" />
                <div class="buttons">
                    <button v-if="isRandom" class="icon-btn" @click="() => $router.go(0)">
                        <Icon>shuffle</Icon>
                        <p>Next</p>
                    </button>
                    <button v-if="stats" class="icon-btn" @click="() => toggleFavourite()">
                        <Icon :fill="isFavourite">star</Icon>
                    </button>
                    <button class="icon-btn" :disabled="reloading" @click="() => refresh()">
                        <Icon :spin="reloading">sync</Icon>
                    </button>
                </div>
            </article>
        </header>
    </div>

</template>

<script setup lang="ts">
    import { ProgressExt } from '~/utils/models';
    
    let stats: Ref<ProgressExt | null> = ref(null);
    let reloading = ref(false);

    const _id = useRoute().params.id.toString();
    const isRandom = _id === 'random';
    const { data, pending } = isRandom ? await mangaApi.random() : await mangaApi.fetch(_id);
    const manga = computed(() => data.value?.manga);
    const isFavourite = computed(() => stats.value?.stats.favourite || false);
    const id = computed(() => manga.value?.id || 0);

    const toggleFavourite = async () => {
        if (!id.value) return;
        await mangaApi.favourite(id.value);
        await fetchExt();
    }

    const refresh = async () => {
        if (!manga.value) return;
        reloading.value = true;
        const { data: output } = await mangaApi.reload(manga.value);
        data.value = output.value;
        reloading.value = false;
    }

    const fetchExt = async () => {
        if (!id.value) return;
        const { data } = await mangaApi.extended(id.value);
        stats.value = data.value;
        console.log('Stats updated', { stats });
    }

    onMounted(() => fetchExt());
</script>

<style lang="scss">
    header {
        margin: 10px;

        .image {
            min-width: 300px;
            min-height: 400px;
            height: 100%;
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
            margin: 0 5px;
        }

        article {
            .title { font-size: 2em; }
            .markdown {
                flex: 1;
                overflow: auto;
                max-height: 310px;
                padding: 5px 0;
            }
        }

        .buttons {
            display: flex;
            button, a { margin: 0 5px; }
        }
    }
</style>