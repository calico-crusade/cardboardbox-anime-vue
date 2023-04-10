<template>
    <Loading v-if="pending" />
    <div class="search-wrapper" v-else>
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

        <Card v-for="manga of results?.results" :manga="manga" />
    </div>
</template>

<script setup lang="ts">
    import { Filter } from '~/utils/models';

    const states = [
        { text: 'All', routes: '/search/all', index: 0 },
        { text: 'Completed', routes: '/search/completed', index: 2 },
        { text: 'In Progress', routes: '/search/in-progress', index: 3, aliases: ['inprogress'] },
        { text: 'Bookmarked', routes: '/search/bookmarked', index: 4 },
        { text: 'Favourites', routes: '/search/favourites', index: 1, aliases: [] },
        { text: 'Not Touched', routes: '/search/not', index: 5, aliases: [] }
    ];

    const route = useRoute();
    const state = determineState(route.params.type.toString().toLowerCase()) || 0;
    const filter = ref(routeFilter());
    const routerFilter = ref(routeFilter());
    const { data: results, pending, refresh } = await mangaApi.search(routerFilter);
    const { data: filters } = await mangaApi.filters();
    const advanced = ref(false);
    const allTags = computed(() => filters.value?.find(t => t.key === 'tag')?.values || []);
    const allSorts = computed(() => filters.value?.find(t => t.key === 'sorts')?.values || []);
    
    function determineState(type: string) {
        for(let item of states) {
            if (item.text.toLocaleLowerCase() === type) return item.index;
            if (item.routes.toLowerCase().indexOf(type) !== -1) return item.index;

            const aliases = item.aliases || [];
            if (aliases.indexOf(type) !== -1) return item.index;
        }

        return 0;
    }

    function routeFilter() {
        const query = route.query;
        let filter : Filter = {
            page: 1,
            size: 20,
            search: '',
            include: [],
            exclude: [],
            asc: false,
            sort: 2,
            state,
            nsfw: 2
        };

        if (query['search']) filter.search = query['search'].toString();
        if (query['asc']) filter.asc = true;
        if (query['include']) filter.include = query['include'].toString().split(',');
        if (query['exclude']) filter.exclude = query['exclude'].toString().split(',');
        if (query['sort']) filter.sort = +query['sort'].toString();
        if (query['state'] && state === undefined) filter.state = +query['state'].toString();
        if (query['nsfw']) filter.nsfw = +query['nsfw'].toString();

        return filter;
    }

    function filterRouteUrl() {
        let pars: { [key: string]: any } = {};

        if (filter.value.search) pars['search'] = filter.value.search;
        if (filter.value.include.length > 0) pars['include'] = filter.value.include.join(',');
        if (filter.value.exclude.length > 0) pars['exclude'] = filter.value.exclude.join(',');
        if (filter.value.asc) pars['asc'] = true;
        if (filter.value.sort != 2) pars['sort'] = filter.value.sort;
        if (filter.value.state && state < 0) pars['state'] = filter.value.state;
        if (filter.value.nsfw) pars['nsfw'] = filter.value.nsfw;

        const query = Object.keys(pars).map(t => `${t}=${pars[t]}`).join('&');
        const uri = states.find(t => t.index === filter.value.state)?.routes || '/search/all';
        return `${uri}?${query}`;
    }

    function tagState(tag: string) {
        if (filter.value.include.indexOf(tag) !== -1) return 'include';
        if (filter.value.exclude.indexOf(tag) !== -1) return 'exclude';
        return 'none';
    }

    function tagIcon(tag: string) {
        const state = tagState(tag);
        switch(state) {
            case 'include': return 'add';
            case 'exclude': return 'remove';
        }

        return '';
    }

    function tagToggle(tag: string) {
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
    
    onMounted(() => nextTick(async () => {
        if (!api.token) return;

        //re-render once mounted to fetch authed search cards
        refresh();
    }));
    watch(() => route.query, () => {
        routerFilter.value = routeFilter();
    });
</script>

<style lang="scss">
    .search-wrapper {
        overflow-y: auto;
        .search {
            max-width: min(100%, 1000px);
            margin: 10px auto;
            border: 1px solid var(--color-muted);
            border-radius: 5px;
            overflow: hidden;

            .search-input {
                input, select {
                    //background-color: transparent;
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