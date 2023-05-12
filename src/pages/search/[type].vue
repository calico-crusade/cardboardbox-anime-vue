<template>
<CardList 
    :title="type" 
    :manga="results.results" 
    :pending="pending" 
    @onscrolled="onScroll" 
    @headerstuck="(v) => headerStuck = v"
>
    <div class="search-drawer" :class="{ open: advanced, stuck: headerStuck }">
        <div class="control fill no-top group center-items">
            <input class="fill" type="text" placeholder="Search for your favourite manga!" v-model="filter.search" />
            <button @click="() => filter.search = ''">
                <Icon unsize="true" size="12px">close</Icon>
            </button>
            <div class="sep" />
            <select v-model="filter.state">
                <option v-for="state in states" :value="state.index">
                    {{ state.text }}
                </option>
            </select>
            <label>({{ results.results.length }} / {{ results.count }})</label>
            <button @click="() => advanced = !advanced">
                <Icon unsize="true" size="26px">tune</Icon>
            </button>
            <NuxtLink :to="filterRouteUrl()">
                <Icon unsize="true" size="26px">search</Icon>
            </NuxtLink>
        </div>
        <main>
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
        </main>
    </div>
</CardList>
</template>

<script setup lang="ts">
import { Paginated, ProgressExt, Filter } from "~/models";

const advanced = ref(false);
const headerStuck = ref(false);
const route = useRoute();
const { search, filters: getFilters } = useMangaApi();

const states = [
    { text: 'All', routes: '/search/all', index: 0 },
    { text: 'Completed', routes: '/search/completed', index: 2 },
    { text: 'In Progress', routes: '/search/in-progress', index: 3, aliases: ['inprogress'] },
    { text: 'Bookmarked', routes: '/search/bookmarked', index: 4 },
    { text: 'Favourites', routes: '/search/favourites', index: 1, aliases: [] },
    { text: 'Not Touched', routes: '/search/not', index: 5, aliases: [] }
];

const DEFAULT_FILTER = <Filter>{
    page: 1,
    size: 20,
    search: '',
    include: [],
    exclude: [],
    asc: false,
    sort: 2,
    state: 0,
    nsfw: 2
};

const filter = ref({...DEFAULT_FILTER});
const results = ref(<Paginated<ProgressExt>>{ pages: 0, count: 0, results: [] });
const pending = ref(false);

const { data: filters } = await getFilters();
   
const allTags = computed(() => filters.value?.find(t => t.key === 'tag')?.values || []);
const allSorts = computed(() => filters.value?.find(t => t.key === 'sorts')?.values || []);
const type = computed(() => route.params.type.toString());
const state = computed(() => {
    for(let item of states) {
        if (item.text.toLocaleLowerCase() === type.value) return item.index;
        if (item.routes.toLowerCase().indexOf(type.value) !== -1) return item.index;

        const aliases = item.aliases || [];
        if (aliases.indexOf(type.value) !== -1) return item.index;
    }

    return 0;
});

useHead({ title: 'Find your next binge!' });
useServerSeoMeta({
    title: 'Find your next binge!',
    ogTitle: 'Find your next binge!',
    description: 'Find your next binge on MangaBox!',
    ogDescription: 'Find your next binge on MangaBox!',
    ogImage: 'https://manga.index-0.com/logo.png'
});

const routeFilter = () => {
    const query = route.query || {};
    let outputFilter = {...filter.value};
    outputFilter.state = state.value;

    if (!query) return outputFilter;

    if (query['search']) outputFilter.search = query['search'].toString();
    if (query['asc']) outputFilter.asc = true;
    if (query['include']) outputFilter.include = query['include'].toString().split(',');
    if (query['exclude']) outputFilter.exclude = query['exclude'].toString().split(',');
    if (query['sort']) outputFilter.sort = +query['sort'].toString();
    if (query['state'] && !state.value) outputFilter.state = +query['state'].toString();
    if (query['nsfw']) outputFilter.nsfw = +query['nsfw'].toString();

    return outputFilter;
}

const filterRouteUrl = () => {
    let pars: { [key: string]: any } = {};

    if (filter.value.search) pars['search'] = filter.value.search;
    if (filter.value.include.length > 0) pars['include'] = filter.value.include.join(',');
    if (filter.value.exclude.length > 0) pars['exclude'] = filter.value.exclude.join(',');
    if (filter.value.asc) pars['asc'] = true;
    if (filter.value.sort != 2) pars['sort'] = filter.value.sort;
    if (filter.value.state && state.value < 0) pars['state'] = filter.value.state;
    if (filter.value.nsfw !== 2) pars['nsfw'] = filter.value.nsfw;

    const query = Object.keys(pars).map(t => `${t}=${pars[t]}`).join('&');
    const uri = states.find(t => t.index === filter.value.state)?.routes || '/search/all';
    return `${uri}?${query}`;
}

const tagState = (tag: string) => {
    if (filter.value.include.indexOf(tag) !== -1) return 'include';
    if (filter.value.exclude.indexOf(tag) !== -1) return 'exclude';
    return 'none';
}

const tagIcon = (tag: string) => {
    const state = tagState(tag);
    switch(state) {
        case 'include': return 'add';
        case 'exclude': return 'remove';
    }

    return '';
}

const tagToggle = (tag: string) => {
    const state = tagState(tag);

    const ii = filter.value.include.indexOf(tag);
    const ei = filter.value.exclude.indexOf(tag);

    switch(state) {
        case 'include': 
            if (ii !== -1) filter.value.include.splice(ii, 1);
            if (ei === -1) filter.value.exclude = [...filter.value.exclude, tag];
            break;
        case 'exclude':
            if (ii !== -1) filter.value.include.splice(ii, 1);
            if (ei !== -1) filter.value.exclude.splice(ei, 1);
            break;
        case 'none':
            if (ii === -1) filter.value.include = [...filter.value.include, tag];
            if (ei !== -1) filter.value.exclude.splice(ei, 1);
            break;
    }
}

const fetch = async (reset: boolean) => {
    if (pending.value) return;

    if (reset){
        results.value.results = [];
        results.value.pages = 0;
        results.value.count = 0;
    }

    pending.value = true;
    const { data } = await search({...filter.value}, false);
    pending.value = false;
    if (!data.value) return;

    const unbound = {...data.value};

    results.value.pages = unbound?.pages;
    results.value.count = unbound?.count;
    results.value.results = [...results.value.results, ...unbound.results];
}

const onScroll = async () => {
    const curRes = results.value;
    if (!curRes || curRes.pages <= filter.value.page || pending.value) return;
    
    filter.value.page++;
    await fetch(false);
}

onMounted(() => nextTick(() => {
    filter.value = routeFilter();
    fetch(true);
}));

watch(() => route.query, () => fetch(true));
</script>

<style lang="scss" scoped>
$bg-color: var(--bg-color-accent);
$br-color: transparent;

.search-drawer {
    margin: 5px auto;
    border-radius: 5px;
    overflow: hidden;
    transition: background-color 250ms;

    .control {
        background-color: $bg-color;

        &.no-top { margin-top: 0; }
        a, button { padding: 0 5px; }
    }

    main {
        background-color: $bg-color;
        overflow: hidden;
        max-height: 0;
        transition: all 250ms;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        border-top: 1px solid transparent;
        padding: 0 10px;

        h2 { margin-top: 10px; }

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

                p { margin: auto 0; }
                &.include { border-color: var(--color-success); }
                &.exclude { border-color: var(--color-warning); }
            }

            &:last-child { margin-bottom: 10px; }
        }
    }

    &.open main {
        max-height: 80vh;
        border-top-color: $br-color;
        overflow-y: auto;
    }

    &.stuck { background-color: var(--bg-color-accent-dark); }
}

@media only screen and (max-width: 550px) {
    .control {
        label, select {
            display: none;
        }
    }
}
</style>