<template>
<div class="manga" v-if="mdata">
    <NuxtLink :to="'/manga/' + mdata.manga.id" class="image" :style="{'background-image': 'url(' + proxy(mdata.manga.cover, mdata.manga.referer) + ')'}"></NuxtLink>
    <div class="details masked-overflow">
        <div class="title">
            <NuxtLink :to="'/manga/' + mdata.manga.id">{{ mdata.manga.title }}</NuxtLink>
            <Icon :fill="!!mdata.icon.fill" v-if="mdata.icon">{{ mdata.icon.text }}</Icon>
        </div>
        <template v-if="mdata.stats">
            <div class="source" v-if="mdata.progress">
                <span><b>Progress: </b>&nbsp; {{ mdata.stats.chapterProgress }}% - <Date :date="mdata.progress.updatedAt.toString()" /></span>
            </div>
            <div class="source">
                <span><b>Latest Chapter: </b>&nbsp; <Date :date="mdata.stats.latestChapter?.toString()" /></span>
            </div>
        </template>
        <div class="source">
            <b>Source:</b>&nbsp;{{ mdata.manga.provider }}
        </div>
        <div class="tags">
            <div class="header">Tags: </div>
            <div class="tag nsfw" v-if="mdata.manga.nsfw">NSFW</div>
            <NuxtLink class="tag" v-for="tag of mdata.manga.tags" :to="'/search/all?include=' + tag">{{ tag }}</NuxtLink>
        </div>
        <Markdown class="description" :content="mdata.manga.description" />
    </div>
</div>
<div class="manga" v-if="sdata">
    <NuxtLink :to="'/import?url=' + encodeURIComponent(sdata.manga.url)" class="image" :style="{'background-image': 'url(' + proxy(sdata.manga.cover) + ')'}"></NuxtLink>
    <div class="details masked-overflow">
        <div class="title">
            <NuxtLink :to="'/import?url=' + encodeURIComponent(sdata.manga.url)">{{ sdata.manga.title }}</NuxtLink>
        </div>
        <div class="source">
            <b>Source: </b>&nbsp;{{ sdata.manga.source }}
        </div>
        <div class="source" v-if="sdata.foundVia">
            <b>Found Via:</b>&nbsp; 
            {{ sdata.foundVia.text }} (
                <span title="Confidence Compute Score">CS: {{ sdata.foundVia.compute.toFixed(2) }}%</span>, 
                <span title="Exact Match">EM: {{ sdata.foundVia.exactMatch }}</span>
            )
        </div>
        <div class="source" v-if="sdata.link">
            <b>Link:</b>&nbsp;
            <a :href="sdata.link.url" target="_blank">{{ sdata.link.text }}</a>
        </div>
        <div class="tags">
            <div class="header">Tags: </div>
            <div class="tag nsfw" v-if="sdata.manga.nsfw">NSFW</div>
            <NuxtLink class="tag" v-for="tag of sdata.manga.tags" :to="'/search/all?include=' + tag">{{ tag }}</NuxtLink>
        </div>
        <Markdown class="description" :content="sdata.manga.description" />
    </div>
</div>
</template>

<script setup lang="ts">
import { 
    BaseResult, Chapter, ImageSearchManga, Manga, 
    Stats, MatchResult, Progress, ProgressExt, 
    VisionResult 
} from '~/models';
const { proxy: proxyUrl } = useApiHelper();

interface Props {
    search?: MatchResult | VisionResult | BaseResult | ImageSearchManga;
    manga?: Manga | ProgressExt
}

interface MangaData {
    manga: Manga;
    progress?: Progress;
    stats?: Stats;
    chapter?: Chapter;
    icon?: {
        text: string;
        fill?: boolean;
    }
}

interface SearchData {
    manga: ImageSearchManga;
    foundVia?: {
        text: string;
        compute: number;
        exactMatch: boolean;
    };
    link?: {
        text: string;
        url: string;
    }
}

const { search, manga } = defineProps<Props>();
const mdata = computed(() => determineCardData());
const sdata = computed(() => determineSearchData());

const domain = (url: string) => new URL(url).hostname;

function determineSearchData(): SearchData | undefined {
    if (!search) return undefined;

    if ('description' in search) {
        return {
            manga: search
        }
    }

    if ('filteredTitle' in search) {
        return {
            manga: search.manga,
            foundVia: {
                text: 'Google Vision',
                compute: search.score,
                exactMatch: search.exactMatch
            },
            link: {
                text: domain(search.url),
                url: search.url
            }
        }
    }

    if ('metadata' in search) {
        return {
            manga: search.manga,
            foundVia: {
                text: 'CBA Reverse Search',
                compute: search.score,
                exactMatch: search.exactMatch
            },
            link: {
                text: `${search.manga.source}: Page #${search.metadata.page}`,
                url: `https://mangadex.org/chapter/${search.metadata.chapterId}/${search.metadata.page}`
            }
        }
    }

    return {
        manga: search.manga,
        foundVia: {
            text: search.source === 'title lookup' ? 'Mangadex Search' : 'Sauce Nao',
            compute: search.score * 100,
            exactMatch: search.exactMatch
        },
        link: {
            text: `Manga Home Page`,
            url: `https://mangadex.org/manga/${search.manga.id}`
        }
    }
}

function determineCardData(): MangaData | undefined {
    if (!manga) return undefined;
    const data = ('id' in manga) ? manga : manga.manga;

    if (!manga || 'id' in manga) return { manga: data };

    const { stats, progress, chapter } = manga;

    const getIcon = () => {
        if (stats?.favourite) return { text: 'star', fill: true };
        if (stats?.chapterProgress === 100) return { text: 'check_circle' };
        if (stats?.hasBookmarks) return { text: 'bookmarks' };
        if (progress) return { text: 'collections_bookmark' };
        return undefined;
    }

    return {
        manga: data,
        progress: progress,
        stats: stats,
        chapter: chapter,
        icon: getIcon()
    }
}

const proxy = (url: string, referer?: string) => proxyUrl(url, 'manga-cover', referer);
</script>

<style lang="scss" scoped>
.manga {
    margin-top: var(--margin);
    display: flex;
    flex-flow: row;
    padding: var(--margin);
    text-decoration: none;
    transition: all 250ms;
    background-color: var(--bg-color-accent);
    overflow: hidden;
    border-radius: var(--margin);

    .image {
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        width: 200px;
        max-width: 30vw;
        min-height: 300px;
        border-radius: var(--margin);
    }

    .details {
        flex: 1;
        display: flex;
        flex-flow: column;
        margin-left: var(--margin);
        max-height: 300px;
        overflow: hidden;

        .title {
            display: flex;
            flex-flow: row;
            font-size: 1.5em;
            font-weight: 700;
            align-items: center;

            a {
                flex: 1;
            }
        }

        .tags {
            .header {
                display: inline-block;
                font-weight: bold;
            }

            .tag {
                display: inline-block;
                padding: 3px 5px;
                margin: 3px;
                background-color: var(--color-default);
                border: 1px solid var(--bg-color-offset);
                border-radius: 3px;

                &.nsfw { background-color: var(--color-warning); }
            }
        }
    }
}

.masked-overflow {
    --scrollbar-width: 0px;
    --mask-height: 32px;
    --mask-image-content: linear-gradient(
        to bottom,
        black,
        black calc(100% - var(--mask-height)),
        transparent
    );
    --mask-size-content: calc(100% - var(--scrollbar-width)) 100%;
    --mask-image-scrollbar: linear-gradient(black, black);
    --mask-size-scrollbar: var(--scrollbar-width) 100%;
    mask-image: var(--mask-image-content), var(--mask-image-scrollbar);
    mask-size: var(--mask-size-content), var(--mask-size-scrollbar);
    mask-position: 0 0, 100% 0;
    mask-repeat: no-repeat, no-repeat;
}
</style>