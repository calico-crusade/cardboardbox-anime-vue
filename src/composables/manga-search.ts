import { Paginated, ProgressExt, Filter, Filters } from "~/models";

const STATES = [
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

export const useMangaSearchService = () => {
    const route = useRoute();
    const { search, filters: getFilters } = useMangaApi();

    /** The on-going results shown on the page */
    const results = ref(<Paginated<ProgressExt>>{ pages: 0, count: 0, results: []});
    /** Represents whether the page is actively loading results (true) or not (false) */
    const pending = ref(false);
    /** The fields that can be used to filter the return results */
    const filters = ref(<Filters | null>null);
    /** What to filter the search results by */
    const filter = ref({...DEFAULT_FILTER});
    /** All of the tags that can be used to filter the results */
    const allTags = computed(() => filters.value?.find(t => t.key === 'tag')?.values || []);
    /** All of the fields that can be used to sort the results */
    const allSorts = computed(() => filters.value?.find(t => t.key === 'sorts')?.values || []);
    /** All of the available search states that can be used */
    const states = STATES;
    /** The raw [type] parameter in the url */
    const type = computed(() => route.params.type.toString());
    /** The current search state (based on the [type] parameter in the URL) */
    const state = computed(() => {
        for(let item of states) {
            if (item.text.toLocaleLowerCase() === type.value) return item.index;
            if (item.routes.toLowerCase().indexOf(type.value) !== -1) return item.index;

            const aliases = item.aliases || [];
            if (aliases.indexOf(type.value) !== -1) return item.index;
        }

        return 0;
    });

    /**
     * Executes a POST request to the search endpoint with the filters
     * @param reset Whether or not to clear the current results or append to them
     * @returns Promise<void>
     */
    const fetch = async (reset: boolean = false) => {
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

    /**
     * Converts the URL query parameters to a Filter
     * @returns The filter determined from the query parameters
     */
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

    /**
     * Builds a URL from the search filters
     * @returns The URL that can be used for browser history and re-triggering search
     */
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

    /**
     * Handles the infinite scroll mechanic for the search results
     * @returns Promise<void>
     */
    const onScroll = async () => {
        const element = document.getElementById('search-wrapper');
        if (!element) return;
        
        const curRes = results.value;
        if (!curRes || curRes.pages <= filter.value.page || pending.value) return;

        const bottom = element.scrollTop + element.clientHeight >= element.scrollHeight;
        if (!bottom) return;
        
        filter.value.page++;
        await fetch(false);
    }

    /**
     * Determines the inclusion state of the given tag
     * @param tag The name of the tag
     * @returns Whether the tag is included (include), excluded (exclude), or has no state (none)
     */
    const tagState = (tag: string) => {
        if (filter.value.include.indexOf(tag) !== -1) return 'include';
        if (filter.value.exclude.indexOf(tag) !== -1) return 'exclude';
        return 'none';
    }

    /**
     * Determines the material icon for the current state
     * @param tag The name of the tag
     * @returns The material icon name
     */
    const tagIcon = (tag: string) => {
        const state = tagState(tag);
        switch(state) {
            case 'include': return 'add';
            case 'exclude': return 'remove';
        }

        return '';
    }

    /**
     * Toggles the state of the given tag
     * @param tag The name of the tag
     */
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

    /**
     * To be run during the setup life-cycle hook within Nuxt
     */
    const onSetup = async () => {
        filter.value = routeFilter();

        const { data } = await getFilters();
        filters.value = data.value;

        await fetch(true);
    }

    return {
        results,
        pending,
        filters,
        filter,
        allTags,
        allSorts,
        states,
        state,
        type,

        onScroll,
        fetch,
        filterRouteUrl,
        tagState,
        tagIcon,
        tagToggle,
        onSetup,
    }
};