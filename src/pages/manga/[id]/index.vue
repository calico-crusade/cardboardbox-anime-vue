<template>
    <Loading v-if="pending" />
    <Error v-else-if="!data || !manga" />
    <div class="flex row fill-parent scroll-y" v-else>
        <header class="flex">
            <div class="image" :style="{ 'background-image': 'url(' + proxy(manga.cover) + ')' }"></div>
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
        <main class="flex">
            <section class="drawer flex row" :class="{ 'open': drawerOpen }">
                <div class="title flex" @click="() => drawerOpen = !drawerOpen">
                    <p class="fill">More Details</p>
                    <Icon>{{ drawerOpen ? 'arrow_drop_up' : 'arrow_drop_down' }}</Icon>
                </div>
                <div class="opener">
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
                </div>
            </section>
            <section class="volumes fill">
                <div class="chapter-header flex">
                    <p class="fill">Chapters</p>
                </div>
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

                        <template v-for="chapter of vol.chapters">
                            <template v-if="chapter.versions.length === 0">
                                <NuxtLink class="chapter" :to="'/manga/' + id + '/' + chapter.id" :class="{'active': chapter.read}">
                                    <div class="progress" v-if="chapter.progress" :style="{'width': chapter.progress + '%'}">
                                        <span>{{ chapter.progress.toFixed(2) + '%' }}</span>
                                    </div>
                                    <div class="chapter-content grid by-2">
                                        <span class="cell icon-text">
                                            <Icon v-if="chapter.read">done_all</Icon>
                                            <Icon v-if="chapter.id === stats?.progress?.mangaChapterId">auto_stories</Icon>
                                            <span v-if="chapter.volume">Vol. {{ chapter.volume }}&nbsp;</span>
                                            Ch. {{ chapter.ordinal }}
                                        </span>
                                        <span class="cell icon-text">{{ chapter.title }}</span>
                                        <span class="cell icon-text"><Icon>language</Icon> {{ chapter.language }}</span>
                                        <span class="cell icon-text"><Icon>schedule</Icon> <Date :date="chapter.createdAt.toString()" /></span>
                                    </div>
                                </NuxtLink>
                            </template>
                            <template v-else>
                                <div class="version-chapter">
                                    <div class="progress" v-if="chapter.progress" :style="{'width': chapter.progress + '%'}">
                                        <span>{{ chapter.progress.toFixed(2) + '%' }}</span>
                                    </div>
                                    <NuxtLink class="chapter-root" :to="'/manga' + id + '/' + chapter.id" :class="{'active': chapter.read}">
                                        <div class="chapter-content grid by-2">
                                            <span class="cell icon-text">
                                                <Icon v-if="chapter.read">done_all</Icon>
                                                <Icon v-if="chapter.id === stats?.progress?.mangaChapterId">auto_stories</Icon>
                                                <span v-if="chapter.volume">Vol. {{ chapter.volume }}&nbsp;</span>
                                                Ch. {{ chapter.ordinal }}
                                            </span>
                                            <span class="cell icon-text">{{ chapter.title }}</span>
                                            <span class="cell icon-text"><Icon>language</Icon> {{ chapter.language }}</span>
                                            <span class="cell icon-text"><Icon>schedule</Icon> <Date :date="chapter.createdAt.toString()" /></span>
                                        </div>
                                    </NuxtLink>
                                    <div class="version-drawer" :class="{ open: chapter.open }">
                                        <div class="header grid by-2" @click="() => toggleVersion(chapter)">
                                            <span class="cell icon-text"><Icon>layers</Icon> Other Versions: {{ chapter.versions.length }}</span>
                                            <span class="cell icon-text"><Icon>{{ chapter.open ? 'expand_more' : 'expand_less' }}</Icon></span>
                                        </div>
                                        <div class="version-content">
                                            <NuxtLink v-for="ver in chapter.versions" :to="'/manga/' + id + '/' + ver.id">
                                                <div class="chapter-content grid by-2">
                                                    <span class="cell icon-text">
                                                        <Icon v-if="chapter.read">done_all</Icon>
                                                        <Icon v-if="ver.id === stats?.progress?.mangaChapterId">auto_stories</Icon>
                                                        <span v-if="ver.volume">Vol. {{ ver.volume }}&nbsp;</span>
                                                        Ch. {{ ver.ordinal }}
                                                    </span>
                                                </div>
                                            </NuxtLink>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </template>
                    </div>
                </article>
            </section>
        </main>
    </div>

</template>

<script setup lang="ts">
    import { Volume, VolumeChapter } from '~/utils/manga-api';
    import { ProgressExt } from '~/utils/models';
    
    let stats: Ref<ProgressExt | undefined> = ref(undefined);
    let reloading = ref(false);
    let drawerOpen = ref(true);
    let volumes: Ref<Volume[]> = ref([]);

    const _id = useRoute().params.id.toString();
    const isRandom = _id === 'random';
    const { data, pending } = isRandom ? await mangaApi.random() : await mangaApi.fetch(_id);
    const manga = computed(() => data.value?.manga);
    const isFavourite = computed(() => stats.value?.stats.favourite || false);
    const id = computed(() => manga.value?.id || 0);
    volumes.value = mangaApi.groupVolumes(data.value?.chapters || [], stats.value);

    useHead({ title: manga.value?.title })
    
    useServerSeoMeta({
        title: manga.value?.title,
        ogTitle: manga.value?.title,
        description: manga.value?.description,
        ogDescription: manga.value?.description,
        ogImage: manga.value?.cover,
        twitterCard: 'summary_large_image'
    });

    const toggleVolume = (index: number) => {
        const vol = volumes.value[index];
        vol.collapse = !vol.collapse;
        volumes.value = volumes.value;
    }

    const toggleVersion = (chapter: VolumeChapter) => {
        chapter.open = !chapter.open;
        volumes.value = volumes.value;
    }

    const volumeCollapsed = (index: number) => volumes.value[index].collapse;

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
        volumes.value = mangaApi.groupVolumes(data.value?.chapters || [], stats.value);
        reloading.value = false;
    }

    const fetchExt = async () => {
        if (!id.value) {
            console.log('Skipping fetch, ID isnt present', { data: JSON.stringify(data.value) });
            return;
        }
        const { data: output } = await mangaApi.extended(id.value);
        stats.value = output.value || undefined;
        volumes.value = mangaApi.groupVolumes(data.value?.chapters || [], stats.value);
    }

    const proxy = (url: string) => api.proxyUrl(url, 'manga-cover', manga.value?.referer);

    onMounted(async () => await nextTick(() => fetchExt()));
</script>

<style lang="scss" scoped>
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

    main {
        .drawer {
            margin: 5px 12px;
            width: 430px;
            border-radius: 5px;

            .title {
                padding: 5px;
                cursor: pointer;
                border-bottom: 1px solid var(--bg-color-accent);
                background-color: var(--bg-color-offset);
                border-top-right-radius: 5px;
                border-top-left-radius: 5px;
                p { margin: auto 3px; }
            }

            .opener {
                overflow: hidden;
                max-height: 0;
                padding: 0 5px;
                transition: max-height 250ms;
                background-color: var(--bg-color-offset);
                border-bottom-right-radius: 5px;
                border-bottom-left-radius: 5px;

                :last-child { margin-bottom: 5px; }
            }

            &.open { .opener { max-height: 900px; } }
        }

        .volumes {
            margin: 5px 5px 5px 5px;

            .chapter-header {
                border-radius: 5px;
                background-color: var(--bg-color-offset);
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
                    border-left: 3px solid var(--bg-color-offset);
                    border-top-left-radius: 10px;
                    border-bottom-left-radius: 10px;
                    padding: 10px;
                    .chapter, .version-chapter {
                        padding: 15px;
                        background-color: var(--bg-color-offset);
                        text-decoration: none;
                        margin: 5px;
                        position: relative;
                        &:first-child { display: none; }

                        .progress {
                            position: absolute;
                            top: 0;
                            left: 0;
                            height: 100%;
                            background-color: var(--color-secondary-dark);

                            span {
                                position: absolute;
                                top: 0;
                                left: 50%;
                                transform: translateX(-50%);
                                background-color: var(--accent-1);
                                border-radius: 50%;
                            }
                        }

                        .chapter-content {
                            position: relative;
                            //z-index: 1;
                        }

                        .chapter-root {
                            display: flex;
                            flex-flow: column;
                            position: relative;
                            text-decoration: none;
                            border-bottom: 1px solid var(--brd-color-accent);
                            padding-bottom: 5px;
                        }

                        .version-drawer {
                            padding-top: 5px;
                            border-top: 1px solid var(--bg-color-accent);
                            .header { cursor: pointer; }
                            .version-content {
                                transition: max-height 250ms;
                                max-height: 0;
                                overflow: hidden;
                                margin: 0;

                                .version-item { text-decoration: none; }
                            }

                            &.open {
                                .version-content {
                                    max-height: 100px;
                                    overflow-y: auto;
                                }
                            }
                        }

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
        header {
            flex-flow: column;
            article {
                .title {
                    margin: 0 auto;
                    text-align: center;
                }

                .markdown {
                    max-height: 100vh;
                }
            }

            .buttons {
                margin: 0 auto;
            }
        }

        main {
            flex-flow: column;

            .drawer {
                width: unset;
                margin: 5px 5px;
            }
        }
    }
</style>