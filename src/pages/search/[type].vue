<template>
    <div class="search-wrapper" id="search-wrapper" @scroll="() => onScroll()">
        <section class="search" :class="{ open: advanced}">
            <div class="search-input flex">
                <input type="text" placeholder="Search for your favourite manga!" v-model="filter.search" />
                <select v-model="filter.state">
                    <option v-for="state in states" :value="state.index">
                        {{ state.text }}
                    </option>
                </select>
                <button @click="() => advanced = !advanced">
                    <Icon size="26px">tune</Icon>
                </button>
                <NuxtLink :to="filterRouteUrl()">
                    <Icon size="26px">search</Icon>
                </NuxtLink>
            </div>
            <div class="advanced">
                <h2>Advanced Search Options: </h2>
                <label>Tags</label>
                <div class="button-tags">
                    <button v-for="tag of allTags" :class="tagState(tag)" @click="() => tagToggle(tag)">
                        <Icon unsize="true" size="16px">{{ tagIcon(tag) }}</Icon> 
                        <p>{{ tag }}</p>
                    </button>
                </div>
                <label>Sort Options</label>
                <div class="button-tags">
                    <button v-for="(sort, index) in allSorts" :class="{ include: filter.sort === index}" @click="() => filter.sort = index">{{ sort }}</button>
                </div>
                <div class="button-tags">
                    <button :class="{include: filter.asc}" @click="() => filter.asc = true">
                        <Icon unsize="true" size="16px">arrow_drop_up</Icon>
                        <p>Ascending</p>
                    </button>
                    <button :class="{include: !filter.asc}" @click="() => filter.asc = false">
                        <Icon unsize="true" size="16px">arrow_drop_down</Icon>
                        <p>Descending</p>
                    </button>
                </div>
            </div>
        </section>

        <Card v-for="manga of results.results" :manga="manga" />
        <div class="loading-card">
            <Loading v-if="pending" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { MangaSearchService } from '~/utils/page-services/manga-search.service';

    const advanced = ref(false);
    const route = useRoute();
    const _instance = new MangaSearchService(route);

    const tagState = (tag: string) => _instance.tagState(tag);
    const tagIcon = (tag: string) => _instance.tagIcon(tag);
    const tagToggle = (tag: string) => _instance.tagToggle(tag);
    const filterRouteUrl = () => _instance.filterRouteUrl();
    const onScroll = () => _instance.onScroll();

    const {
        results,
        pending,
        filter,
        allTags,
        allSorts,
        states
    } = _instance;

    _instance.onSetup();
    
    onMounted(async () => await nextTick(() => {
        if (!api.token) return;
        //Force re-check if authed
        _instance.fetch(true);
    }));

    watch(() => route.query, () => _instance.fetch(true));
</script>

<style lang="scss">
    .search-wrapper {
        overflow-y: auto;
        padding: 0 10px;
        .search {
            max-width: min(100%, 1000px);
            margin: 10px auto;
            border: 1px solid var(--color-muted);
            border-radius: 5px;
            overflow: hidden;

            .search-input {
                input, select {
                    border-radius: 0;
                    border-right: 1px solid var(--color-muted);
                }

                input { flex: 1; }

                button {
                    border-right: 1px solid var(--color-muted);
                    background-color: var(--bg-color);
                    padding-right: 5px;
                }

                a {
                    margin: auto 0;
                    padding: 5px 5px 0 5px;
                    background-color: var(--bg-color);
                }
            }
            .advanced {
                background-color: var(--bg-color);
                max-height: 0px;
                overflow: hidden;
                transition: all 250ms;
                border-bottom-left-radius: 5px;
                border-bottom-right-radius: 5px;
                border-top: 1px solid transparent;
                padding: 0 10px;

                h2 {
                    margin-top: 10px;
                }

                .button-tags {
                    display: flex;
                    flex-flow: row wrap;

                    button {
                        background-color: transparent;
                        border: 1px solid var(--color-primary);
                        display: flex;
                        flex-flow: row;
                        margin: 3px;
                        padding: 5px;
                        border-radius: 3px;

                        p {
                            margin: auto 0;
                        }

                        &.include { border-color: var(--color-success); }
                        &.exclude { border-color: var(--color-warning); }
                    }

                    &:last-child {
                        margin-bottom: 10px;
                    }
                }                
            }

            &.open {
                .advanced {
                    max-height: 900px;
                    border-top-color: var(--color-muted);
                }
            }
        }

        .manga {
            max-width: min(100%, 1000px);
            margin: 10px auto;
        }
    }
</style>