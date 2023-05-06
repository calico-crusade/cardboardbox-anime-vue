<template>
<div class="page-wrapper flex fill-parent" :class="{ 'open': navOpen }">
    <Loading v-if="pending" />
    <Error v-else-if="error" :message="error?.message" />
    <template v-else-if="manga">
        <main class="fill flex" @click="pageClick" ref="clickarea" :class="pageStyle" v-if="!external">
            <template v-if="pageStyle === PageStyle.SinglePageFit">
                <div class="image" :style="{ 'background-image': `url(${pageUrl})`, 'filter': imageFilter }" />
                <img class="hidden" v-if="nextPageImage" :src="nextPageImage" />
            </template>

            <template v-else-if="pageStyle === PageStyle.LongStrip">
                <img v-for="image of pageUrls" :src="image" :style="{ 'filter': imageFilter }" />
            </template>

            <template v-else-if="pageStyle === PageStyle.DoublePage">
                <div class="image" :style="{ 'background-image': `url(${pageUrl})`, 'filter': imageFilter}" />
                <div class="image" v-if="nextPageImage" :style="{ 'background-image': `url(${nextPageImage})`, 'filter': imageFilter}" />
            </template>

            <template v-else>
                <img :src="pageUrl" :style="{ 'filter': imageFilter }" />
                <img class="hidden" v-if="nextPageImage" :src="nextPageImage" />
            </template>

            <div class="progress-bar" :class="progressBar">
                <NuxtLink 
                    v-for="(_, i) of pageUrls" 
                    :to="genLink('Page', i + 1)"
                    :class="{ 'active': i < page }"
                    class="progress"
                />
            </div>
        </main>
        <main class="fill flex external" v-else>
            <div class="center">
                This is an external manga! Click <a :href="external" target="_blank">here</a> to read it.
            </div>
        </main>
        <aside class="flex row">
            <header class="flex center-items">
                <NuxtLink :to="'/manga/' + id" class="flex fill center-items">
                    <Icon>arrow_back</Icon>
                    <p class="text-center fill">{{ manga.title }}</p>
                </NuxtLink>
            </header>
            <article class="fill">
                <Tabs flip>
                    <Tab icon="info" scrollable keep-alive class-name="flex row">
                        <div class="settings-tab flex row">
                            <img :src="proxy(manga.cover, 'manga-cover', manga.referer)" class="rounded" />
                            <h3 class="margin-top">
                                {{ manga.title }}
                            </h3>
                            <p><b>Manga Progress: </b> {{ (((chapterIndex + 1) / chapters.length) * 100).toFixed(2) }}%</p>
                            <p v-if="!external"><b>Chapter Progress: </b> {{ (page / (chapter?.pages?.length ?? 1) * 100).toFixed(2) }}%</p>

                            <template v-for="attr of chapter?.attributes">
                                <p v-if="isLink(attr.value)">
                                    <a :href="attr.value" target="_blank">
                                        <b>{{ attr.name }}</b>
                                    </a>
                                </p>
                                <p v-else-if="attr.name === 'Scanlation Discord'">
                                    <a :href="'https://discord.gg/' + attr.value" target="_blank"><b>Scanlation Discord</b></a>
                                </p>
                                <p v-else>
                                    <b>{{ attr.name }}:</b> {{ attr.value }}
                                </p>
                            </template>

                            <div class="control no-top">
                                <select :value="chapterId" @change="(val) => genLinkVal(1, val)">
                                    <option v-for="chap in chapters" :value="chap.id">
                                        Ch. {{ chap.ordinal }} - {{ chap.title }}
                                    </option>
                                </select>
                            </div>
                            <div class="control no-top" v-if="pageStyle !== PageStyle.LongStrip && !external">
                                <select :value="page" @change="(val) => genLinkVal(val)">
                                    <option v-for="(_, index) in chapter?.pages" :value="index + 1">
                                        Page: #{{ index + 1 }}
                                    </option>
                                </select>
                            </div>
                            <div class="btn-group">
                                <NuxtLink :class="{ 'disabled': !hasPreviousChapter }" :to="genLink('PrevChapter')">
                                    <Icon>skip_previous</Icon>
                                </NuxtLink>
                                <NuxtLink :class="{ 'disabled': !hasPreviousPage }" :to="genLink('PrevPage')" v-if="pageStyle !== PageStyle.LongStrip">
                                    <Icon>navigate_before</Icon>
                                </NuxtLink>
                                <NuxtLink :to="genLink('ChapterStart')">
                                    <Icon>restart_alt</Icon>
                                </NuxtLink>
                                <NuxtLink :class="{ 'disabled': !hasNextPage }" :to="genLink('NextPage')" v-if="pageStyle !== PageStyle.LongStrip">
                                    <Icon>navigate_next</Icon>
                                </NuxtLink>
                                <NuxtLink :class="{ 'disabled': !hasNextChapter }" :to="genLink('NextChapter')">
                                    <Icon>skip_next</Icon>
                                </NuxtLink>
                            </div>
                            <div class="btn-group-vert">
                                <button @click="copyUrl(`manga/${id}/${chapterId}?page=${page}`)">
                                    <Icon>auto_stories</Icon>
                                    <p>Copy Page Link</p>
                                </button>
                                <button @click="copyUrl('manga/' + id)">
                                    <Icon>share</Icon>
                                    <p>Copy Manga Link</p>
                                </button>
                                <NuxtLink :to="'/manga/' + id">
                                    <Icon>menu_book</Icon>
                                    <p>Manga Home page</p>
                                </NuxtLink>
                                <a :href="manga.url" target="_blank">
                                    <Icon>home</Icon>
                                    <p>Manga Source Page</p>
                                </a>
                                <button :disabled="downloading" @click="downloadData(pageUrl)">
                                    <Icon :spin="downloading">{{ !downloading ? 'download' : 'sync' }}</Icon>
                                    <p>Download Page</p>
                                </button>
                                <button :disabled="downloading" @click="downloadData(chapterUrl)">
                                    <Icon :spin="downloading">{{ !downloading ? 'download_for_offline' : 'sync' }}</Icon>
                                    <p>Download Chapter</p>
                                </button>
                                <NuxtLink :to="`/manga/${id}/${chapterId}/strip?page=${page}`">
                                    <Icon>auto_fix</Icon>
                                    <p>Create Strip</p>
                                </NuxtLink>
                                <NuxtLink :to="genLink('ChapterStart')">
                                    <Icon>restart_alt</Icon>
                                    <p>Restart Chapter</p>
                                </NuxtLink>
                                <button :disabled="bookmarking" @click="toggleBookmark">
                                    <Icon :spin="bookmarking">bookmark</Icon>
                                    <p>Bookmark Page</p>
                                </button>
                            </div>
                        </div>
                    </Tab>
                    <Tab icon="settings" scrollable keep-alive class-name="flex row">
                        <div class="settings-tab flex row">
                            <h3>Settings</h3>
                            <div class="control checkbox">
                                <CheckBox v-model="invertControls">Invert Page Controls</CheckBox>
                            </div>
                            <div class="control checkbox">
                                <CheckBox v-model="forwardOnly">No Directional Buttons</CheckBox>
                            </div>
                            <div class="control" v-if="filter === FilterStyle.Custom">
                                <label class="no-bot">Custom Filter</label>
                                <input type="text" v-model="customFilter" placeholder="Custom CSS filter" />
                            </div>
                            <div class="control">
                                <label class="no-bot">Progress Bar Style</label>
                                <select v-model="progressBar">
                                    <option v-for="style in PROGRESS_BAR_STYLES" :value="style">
                                        {{ style }}
                                    </option>
                                </select>
                            </div>
                            <div class="control">
                                <label class="no-bot">Scroll amount on key event</label>
                                <input type="number" min="0" max="1000" step="10" v-model="scrollAmount" />
                            </div>
                            <div class="control">
                                <label class="no-bot">Image Style</label>
                                <select v-model="pageStyle">
                                    <option v-for="style in PAGE_STYLES" :value="style">
                                        {{ style }}
                                    </option>
                                </select>
                            </div>
                            <div class="control">
                                <label class="no-bot">Image Filter</label>
                                <select v-model="filter">
                                    <option v-for="style in FILTER_STYLES" :value="style">
                                        {{ style }}
                                    </option>
                                </select>
                            </div>
                            <div class="control">
                                <label class="no-bot">Image Brightness ({{ brightness }}%)</label>
                                <input type="range" min="1" max="100" v-model="brightness" />
                            </div>
                            <div class="btn-group-vert">
                                <button @click="fullscreen">
                                    <Icon>fullscreen</Icon>
                                    <p>Toggle Fullscreen</p>
                                </button>
                                <button @click="resetPages">
                                    <Icon>sync</Icon>
                                    <p>Refresh Page Links</p>
                                </button>
                            </div>
                        </div>
                    </Tab>
                    <Tab v-if="bookmarks.length > 0" icon="bookmark" scrollable keep-alive class-name="flex row">
                        <template v-for="bookmark in bookmarks">
                        <NuxtLink class="bookmark" v-for="p of bookmark.pages" :to="genLink('Page', p, bookmarkChapter(bookmark)?.id)">
                            <img :src="bookmarkImage(bookmark, p)" :style="{ 'filter': imageFilter }" />
                            <div class="details">
                                <p>Ch. {{ bookmarkChapter(bookmark)?.ordinal }} Pg. {{ p }}</p>
                                <p>Last Updated: <Date :date="bookmark.createdAt" /></p>
                            </div>
                        </NuxtLink>
                        </template>
                    </Tab>
                </Tabs>
            </article>
        </aside>
    </template>
</div>
</template>

<script setup lang="ts">
import { 
    PageStyle, PAGE_STYLES, 
    PROGRESS_BAR_STYLES, 
    FilterStyle, FILTER_STYLES, Bookmark 
} from '~/models';

type LinkTypes = 'NextChapter' | 'PrevChapter' | 'NextPage' | 'PrevPage' | 'ChapterStart' | 'Page';

definePageMeta({ layout: 'nohead' });

const { proxy, download } = useApiHelper();
const { 
    token,
    invertControls,
    forwardOnly,
    brightness,
    pageStyle,
    filter,
    customFilter,
    progressBar,
    apiUrl,
    menuOpen,
    scrollAmount
} = useAppSettings();

const downloading = ref(false);

const navOpen = computed({
    get: () => {
        if (!process.client) return true;
        return menuOpen.value;
    },
    set: (value: boolean) => menuOpen.value = value
});

const {
    pending,
    external,
    manga,
    chapters,
    chapter,
    chapterId,
    pageUrl,
    pageUrls,
    title,
    error,
    nextPageImage,
    chapterIndex,
    hasNextChapter,
    hasNextPage,
    hasPreviousPage,
    hasPreviousChapter,
    hasPrevPageAbsolute,
    hasNextPageAbsolute,
    bookmarks,
    bookmarking,
    id,
    stats,
    page,

    DEFAULT_IMAGE,

    resetPages,
    fetch,
    mouseInRegion,
    toggleBookmark
} = usePageService();

const route = useRoute();
const chapterUrl = computed(() => `${apiUrl}/manga/${id.value}/${chapterId.value}/download`);
const imageFilter = computed(() => {

    let filters: { [key: string]: string } = {
        'brightness': brightness.value + '%'
    };

    switch(filter.value) {
        case FilterStyle.Invert: filters['invert'] = '100%'; break;
        case FilterStyle.BlueLight:
            filters['sepia'] = '40%';
            filters['saturate'] = '200%';
            break;
        case FilterStyle.BluePrint:
            filters['sepia'] = '100%';
            filters['saturate'] = '500%';
            filters['hue-rotate'] = '180deg';
            break;
        case FilterStyle.Custom:
            if (customFilter.value) return customFilter.value;
            break;
    }

    return Object.keys(filters)
        .map(key => `${key}(${filters[key]})`)
        .join(' ');
});

const clickarea = ref<HTMLElement | undefined>();

useHead({ title });
useServerSeoMeta({
    title,
    ogTitle: title,
    description: manga.value?.description,
    ogDescription: manga.value?.description,
    ogImage: proxy(manga.value?.cover || ''),
    twitterCard: 'summary_large_image'
});

fetch(true);

const pageClick = (event: MouseEvent) => {
    if (!clickarea.value) return;

    const output = mouseInRegion(event, clickarea.value);

    if(output.includes('center')) {
        menuOpen.value = !menuOpen.value;
        return;
    }

    if (forwardOnly.value) {
        const link = genLink('NextPage');
        if (link) navTo(link);
        return;
    }

    let isBack = output.includes('left') || (output.includes('top') && !output.includes('right'));
    let isForward = output.includes('right') || (output.includes('bottom') && !output.includes('left'));

    if (invertControls.value) {
        const isfor = isForward;
        isForward = isBack;
        isBack = isfor;
    }

    if (isBack) {
        const link = genLink('PrevPage');
        if (link) navTo(link);
        return;
    }

    if (isForward) {
        const link = genLink('NextPage');
        if (link) navTo(link);
        return;
    }
};

function genLink(type: LinkTypes, p?: number, c?: number): string | undefined {
    const chapter = c || chapterId.value;
    const pageNum = p || page.value;

    switch(type) {
        case 'ChapterStart': return `/manga/${id.value}/${chapter}?page=1`;
        case 'NextChapter':
            if (!hasNextChapter.value) return undefined;
            return `/manga/${id.value}/${chapters.value[chapterIndex.value + 1].id}?page=1`;
        case 'PrevChapter':
            if (!hasPreviousChapter.value) return undefined;
            return `/manga/${id.value}/${chapters.value[chapterIndex.value - 1].id}?page=9999`;
        case 'NextPage':
            if (!hasNextPage.value) return undefined;
            if (!hasNextPageAbsolute.value) return genLink('NextChapter');
            return `/manga/${id.value}/${chapter}?page=${pageNum + 1}`;
        case 'PrevPage':
            if (!hasPreviousPage.value) return undefined;
            if (!hasPrevPageAbsolute.value) return genLink('PrevChapter');
            return `/manga/${id.value}/${chapter}?page=${pageNum - 1}`;
        case 'Page': return `/manga/${id.value}/${chapter}?page=${pageNum}`;
    }
}

function genLinkVal(p: number | Event, c?: number | Event) {
    const chapter = !c ? chapterId.value : (typeof c === 'number' ? c : +(<any>c.target)!.value);
    const page = typeof p === 'number' ? p : +(<any>p.target)!.value;

    const link = genLink('Page', page, chapter);
    if (!link) return;
    navTo(link);
}

const navTo = (link: string) => navigateTo(link);

const copyUrl = (url: string) => {
    navigator.clipboard.writeText(`${window.location.protocol}//${window.location.host}/${url}`);
}

const bookmarkChapter = (mark: Bookmark) => {
    return chapters.value.find(t => t.id === mark.mangaChapterId);
}

const bookmarkImage = (mark: Bookmark, page: number) => {
    const chapter = bookmarkChapter(mark);
    if (!chapter) return DEFAULT_IMAGE;

    const url = chapter.pages[page - 1];
    return url ? proxy(url, 'manga-page', manga.value?.referer) : DEFAULT_IMAGE;
};

const downloadData = async (url: string, name?: string) => {
    downloading.value = true;
    await download(url, name);
    downloading.value = false;
}

const isLink = (url: string) => url.toLowerCase().startsWith('http');

const fullscreen = () => {
    const elem = <any>document.documentElement;
    const doc = <any>document;

    const isFullScreen = ((<any>window).fullScreen) || 
        (window.innerWidth == screen.width && window.innerHeight == screen.height) ||
        (!window.screenTop && !window.screenY);

    if (isFullScreen) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (doc.webkitExitFullscreen) { /* Safari */
            doc.webkitExitFullscreen();
        } else if (doc.msExitFullscreen) { /* IE11 */
            doc.msExitFullscreen();
        }
        return;
    }

    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}

onMounted(() => nextTick(() => setTimeout(() => {
    navOpen.value = menuOpen.value;
    if (!token.value) return;
    //Refetch with authentication context
    console.log('Refetching');
    fetch(true);
}, 100)));

watch(() => route.query, () => fetch(false));
</script>

<style lang="scss" scoped>
$navwidth: 400px;
$progress-height: 10px;
.page-wrapper {
    main {
        position: relative;
        overflow: auto;
        max-width: 100%;
        transition: all 150ms;

        img {
            max-width: 100%;
        }

        .image {
            flex: 1;
            background-position: center;
            background-size: contain;
            background-repeat: no-repeat;
        }

        &.single-page {
            img {
                margin: 0 auto;

                &.hidden {
                    display: none;
                }
            }
        }

        &.long-strip {
            flex-flow: column;
        }

        &.fit-to-width {
            img {
                width: 100%;
                max-width: 100%;
                max-height: unset;
                margin: auto;
            }
        }

        &.fit-to-height {
            img {
                margin: auto;
                max-width: unset;
                max-height: 100%;
                height: 100%;
            }
        }

        &.natural-size {
            img {
                margin: auto;
                max-width: unset;

                &.hidden {
                    position: absolute;
                    left: -100%;
                }
            }
        }

        .progress-bar {
            position: absolute;
            display: flex;
            flex-flow: row;

            .progress {
                flex: 1;
                background-color: var(--bg-color-accent);
                transition: all 250ms;
                cursor: pointer;

                &.active {
                    background-color: var(--color-primary-trans);
                }
            }

            &.bottom {
                width: 100%;
                height: $progress-height;
                bottom: 0;
                left: 0;

                .progress {
                    height: 100%;
                }

                &:hover {
                    height: #{$progress-height * 2};
                }
            }

            &.left, &.right {
                position: absolute;
                top: 0;
                height: 100%;
                flex-flow: column;
                width: $progress-height;

                .progress {
                    width: 100%;
                    height: 100%;
                }

                &:hover {
                    width: #{$progress-height * 2};
                }
            }

            &.left {
                left: 0;
            }

            &.right {
                right: 0;
            }
        }

        &.external {
            a { text-decoration: underline; }
        }
    }
    aside {
        width: $navwidth;
        margin-right: $navwidth * -1;
        transition: all 150ms;
        max-width: 100vw;
        background-color: var(--bg-color-accent);

        header {
            margin: 0 10px;
            overflow: hidden;

            a { 
                overflow: hidden;
                margin-top: 5px;
                p {
                    overflow: hidden;
                    white-space: pre;
                    text-overflow: ellipsis;
                }
            }
        }

        .settings-tab {
            padding: 0 3px;
            img {
                max-height: 300px;
                margin: 0 auto;
            }


            h3 {
                white-space: pre;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            a {
                text-decoration: underline;
            }
        }

        .bookmark {
            display: flex;
            flex-flow: row;
            padding: var(--margin);
            border-radius: var(--margin);

            img {
                width: 50px;
                border-radius: var(--margin);
            }

            .details {
                flex: 1;
                display: flex;
                flex-flow: column;
                margin: auto 5px;
                border-right: 1px solid transparent;
            }

            &:hover {
                background-color: var(--bg-color-accent);
            }
        }
    }

    &.open {
        aside {
            margin-right: 0;
        }

        main {
            max-width: calc(100vw - #{$navwidth});
        }
    }
}
</style>