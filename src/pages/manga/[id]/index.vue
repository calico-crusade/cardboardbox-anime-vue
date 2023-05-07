<template>
<Loading v-if="pending" />
<Error v-else-if="error" :message="error?.message" />
<div v-else class="manga-details flex fill-parent scroll-y">
    <div v-if="manga" class="manga-header flex row">
        <div class="image" :style="{ 'background-image': 'url(' + proxy(manga.cover) + ')' }"></div>
        <a class="title" :href="manga.url" target="_blank">{{ manga.title }}</a>
        <div class="buttons flex center-horz">
            <NuxtLink class="icon-btn" v-if="resumeUrl" :to="resumeUrl">
                <Icon>play_arrow</Icon>
                <p>Resume</p>
            </NuxtLink>
            <button v-if="isRandom" class="icon-btn" @click="() => $router.go(0)">
                <Icon>shuffle</Icon>
                <p>Next Random Manga</p>
            </button>
            <button v-if="stats" class="icon-btn" @click="toggleFavourite">
                <Icon :fill="isFavourite">star</Icon>
                <p>{{ isFavourite ? 'Unfavourite' : 'Favourite' }}</p>
            </button>
            <button v-if="stats?.progress" :disabled="reloading" class="icon-btn" @click="resetProgress">
                <Icon :spin="reloading">delete</Icon>
                <p>Reset Progress</p>
            </button>
            <button class="icon-btn" :disabled="reloading" @click="refresh">
                <Icon :spin="reloading">sync</Icon>
                <p>Reload Source</p>
            </button>
            <button class="icon-btn" @click="() => copyUrl()">
                <Icon>content_copy</Icon>
                <p>Copy Manga Url</p>
            </button>
        </div>
        <div class="drawers">
            <Drawer title="Description" v-if="manga.description">
                <Markdown :content="manga.description" />
            </Drawer>
            <Drawer title="More Details">
                <div class="tags">
                    <span>Alternate Titles</span>
                    <span v-for="tag in manga.altTitles">{{ tag }}</span>
                </div>
                <div class="tags in-line">
                    <span>Tags </span>
                    <span v-if="manga.nsfw" class="warning">Nsfw</span>
                    <NuxtLink v-for="tag in manga.tags" :to="'/search/all?include=' + tag">{{ tag }}</NuxtLink>
                </div>
                <div class="tags in-line">
                    <span>Details </span>
                    <span v-for="tag of manga.attributes">
                        <b>{{ tag.name }}</b>: {{ tag.value }}
                    </span>
                </div>
            </Drawer>
        </div>
    </div>
    <main class="volumes fill flex row">
        <div class="chapter-header flex">
            <p class="fill">Chapters</p>
            <button @click="() => collapseToggle()">
                <Icon>{{ allCollapsed ? 'arrow_drop_up' : 'arrow_drop_down' }}</Icon>
            </button>
        </div>
        <Loading v-if="volumes.length === 0" />
        <article class="volume" v-for="(vol, index) in volumes">
            <div class="name" @click="() => toggleVolume(index)">{{ vol.name ? 'Volume ' + vol.name : 'No Volume' }}</div>
            <button class="collapse-btn" @click="() => toggleVolume(index)">
                <Icon>{{ volumeCollapsed(index) ? 'expand_more' : 'expand_less' }}</Icon>
            </button>
            <div class="chapters" :class="{'collapse': volumeCollapsed(index)}">
                <a class="chapter grid by-2" @click="() => toggleVolume(index)">
                    <span class="cell">{{ vol.name ? 'Volume ' + vol.name : 'No Volume' }}</span>
                    <span class="cell icon-text"><Icon>expand_more</Icon> Open</span>
                    <span class="cell icon-text"><Icon>layers</Icon> {{ vol.chapters.length }} Chapters</span>
                </a>
                <VolumeCard v-for="chapter of vol.chapters" :id="id" :chapter="chapter" :stats="stats" />
            </div>
        </article>
    </main>
</div>
</template>

<script setup lang="ts">
import { ProgressExt, Volume } from '~/models';

const { 
    random,
    fetch, 
    groupVolumes, 
    favourite, 
    reload,
    extended,
    resetProgress: reset
} = useMangaApi();

const { proxy: proxyUrl, toPromise } = useApiHelper();

let stats: Ref<ProgressExt | undefined> = ref(undefined);
let reloading = ref(false);
let volumes: Ref<Volume[]> = ref([]);

const _id = useRoute().params.id.toString();
const isRandom = _id === 'random';
const { data, pending, error } = isRandom ? random() : fetch(_id);
const manga = computed(() => data.value?.manga);
const isFavourite = computed(() => stats.value?.stats.favourite || false);
const id = computed(() => manga.value?.id || 0);
volumes.value = groupVolumes(data.value?.chapters || [], stats.value);

const proxy = (url: string) => proxyUrl(url, 'manga-cover', manga.value?.referer);

const allCollapsed = computed(() => !!volumes.value.find(t => !t.collapse));
const currentChapter = computed(() => data.value?.chapters.find(t => t.id === stats.value?.progress?.mangaChapterId));
const resumeUrl = computed(() => currentChapter.value ? `/manga/${manga.value?.id}/${currentChapter.value.id}?page=${(stats.value?.progress?.pageIndex ?? 0) + 1}` : undefined);
const title = computed(() => manga.value?.title ?? 'Manga Not Found');
const description = computed(() => manga.value?.description ?? 'Find your next binge on MangaBox!');
const cover = computed(() => proxy(manga.value?.cover ?? 'https://cba.index-0.com/assets/broken.webp'));

useHead({ title })

useServerSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description,
    ogImage: cover,
    twitterCard: 'summary_large_image'
});

const toggleVolume = (index: number) => {
    const vol = volumes.value[index];
    vol.collapse = !vol.collapse;
    volumes.value = volumes.value;
}

const volumeCollapsed = (index: number) => volumes.value[index].collapse;

const collapseToggle = () => {
    const collapse = allCollapsed.value;
    for(let vol of volumes.value)
        vol.collapse = collapse;
};

const toggleFavourite = async () => {
    if (!id.value) return;
    await toPromise(favourite(id.value));
    fetchExt();
}

const refresh = async () => {
    if (!manga.value) return;
    reloading.value = true;

    const output = await toPromise(reload(manga.value));
    data.value = output ?? null;
    volumes.value = groupVolumes(data.value?.chapters || [], stats.value);
    reloading.value = false;
}

const fetchExt = async () => {
    if (!id.value) {
        console.log('Skipping fetch, ID isnt present', { data: JSON.stringify(data.value) });
        return;
    }
    reloading.value = true;

    stats.value = await toPromise(extended(id.value));
    volumes.value = groupVolumes(data.value?.chapters || [], stats.value);
    reloading.value = false;
}

const resetProgress = async () => {
    reloading.value = true;
    await toPromise(reset(id.value));
    fetchExt();
}

const copyUrl = () => {
    const baseUrl = `${window.location.protocol}//${window.location.host}/manga/${id.value}`;
    navigator.clipboard.writeText(baseUrl);
}

onMounted(() => nextTick(() => setTimeout(() => fetchExt(), 100)));
</script>

<style lang="scss" scoped>
$bg-color: var(--bg-color-accent);
.manga-details {
    position: unset;
    .manga-header {
        position: relative;
        margin: 5px;
        width: 430px;
        height: auto;

        .image {
            max-width: 100%;
            min-height: 400px;
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
            margin: 0 5px;
        }

        a.title {
            font-size: 2em;
            text-align: center;
            margin-top: 5px;
        }

        .buttons {
            flex-flow: row wrap;
            align-items: center;
            button, a { 
                margin: 5px; 
                p { display: none; }
            }
        }
    }

    .volumes {
        position: relative;
        margin: 5px 5px 5px 5px;

        .chapter-header {
            border-radius: 5px;
            background-color: $bg-color;
            p {
                margin: auto 5px;
                padding: 7.5px 0;
            }
        }

        .volume {
            display: flex;
            flex-flow: column;
            position: relative;
            margin: 10px 0;
            .collapse-btn {
                position: absolute;
                top: 0;
                right: 0;
                transform: translateY(-50%);
            }
            .name {
                position: absolute;
                top: 50%;
                left: 5px;
                transform: rotate(-90deg) translateX(-37%);
                transform-origin: left;
                cursor: pointer;
            }
            .chapters {
                margin-left: 5px;
                display: flex;
                flex-flow: column;
                border-left: 3px solid #{$bg-color};
                border-top-left-radius: 10px;
                border-bottom-left-radius: 10px;
                padding: 10px;
                .chapter, .version-chapter {
                    padding: 15px;
                    background-color: $bg-color;
                    text-decoration: none;
                    margin: 5px;
                    position: relative;
                    &:first-child { display: none; }

                    &.resume { background-color: var(--accent-1); }
                }

                &.collapse {
                    .chapter:first-child { display: grid; }
                    .chapter:not(:first-child), .version-chapter:not(:first-child) { display: none; }
                }
            }
        }
    }
}

@media only screen and (max-width: 1050px) {
    .manga-details {
        flex-flow: column;

        .manga-header {
            width: unset;
            flex: 1;
        }
    }
}

@media only screen and (max-width: 400px) {
    .manga-details .manga-header .buttons {
        margin: 5px;
        flex-flow: column;

        button, a {
            flex: 1;
            p { 
                display: block;
                margin-left: 10px;
            }
        }
    }
}
</style>