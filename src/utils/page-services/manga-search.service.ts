import { Paginated, ProgressExt, Filter, Filters } from "../models";

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

export class MangaSearchService {

    /** The on-going results shown on the page */
    results = ref(<Paginated<ProgressExt>>{ pages: 0, count: 0, results: []});
    /** Represents whether the page is actively loading results (true) or not (false) */
    pending = ref(false);
    /** The fields that can be used to filter the return results */
    filters = ref(<Filters | null>null);
    /** What to filter the search results by */
    filter = ref({...DEFAULT_FILTER});
    /** All of the tags that can be used to filter the results */
    allTags = computed(() => this.filters.value?.find(t => t.key === 'tag')?.values || []);
    /** All of the fields that can be used to sort the results */
    allSorts = computed(() => this.filters.value?.find(t => t.key === 'sorts')?.values || []);
    /** All of the available search states that can be used */
    states = STATES;
    /** The current search state (based on the [type] parameter in the URL) */
    state = this.determineState();
    
    /** The raw [type] parameter in the url */
    private get _type() { return this._route?.params?.type?.toString(); }
    /** All of the query parameters in the url */
    private get _query() { return this._route?.query; }

    constructor(private _route: any) {}

    /**
     * Takes the [type] paramter from the URL and deteremines the search state
     * @returns The numeric representation of the search state.
     */
    private determineState() {
        for(let item of this.states) {
            if (item.text.toLocaleLowerCase() === this._type) return item.index;
            if (item.routes.toLowerCase().indexOf(this._type) !== -1) return item.index;

            const aliases = item.aliases || [];
            if (aliases.indexOf(this._type) !== -1) return item.index;
        }
        return 0;
    }

    /**
     * Converts the URL query parameters to a Filter
     * @returns The filter determined from the query parameters
     */
    private routeFilter() {
        const query = this._query || {};
        let filter = {...this.filter.value};
        filter.state = this.state;

        if (!query) return filter;

        if (query['search']) filter.search = query['search'].toString();
        if (query['asc']) filter.asc = true;
        if (query['include']) filter.include = query['include'].toString().split(',');
        if (query['exclude']) filter.exclude = query['exclude'].toString().split(',');
        if (query['sort']) filter.sort = +query['sort'].toString();
        if (query['state'] && this.state === undefined) filter.state = +query['state'].toString();
        if (query['nsfw']) filter.nsfw = +query['nsfw'].toString();

        return filter;
    }

    /**
     * Handles the infinite scroll mechanic for the search results
     * @returns Promise<void>
     */
    async onScroll() {
        const element = document.getElementById('search-wrapper');
        if (!element) return;
        
        const curRes = this.results.value;
        if (!curRes || curRes.pages <= this.filter.value.page || this.pending.value) return;

        const bottom = element.scrollTop + element.clientHeight >= element.scrollHeight;
        if (!bottom) return;
        
        this.filter.value.page++;
        await this.fetch(false);
    }

    /**
     * Builds a URL from the search filters
     * @returns The URL that can be used for browser history and re-triggering search
     */
    filterRouteUrl() {
        let pars: { [key: string]: any } = {};

        if (this.filter.value.search) pars['search'] = this.filter.value.search;
        if (this.filter.value.include.length > 0) pars['include'] = this.filter.value.include.join(',');
        if (this.filter.value.exclude.length > 0) pars['exclude'] = this.filter.value.exclude.join(',');
        if (this.filter.value.asc) pars['asc'] = true;
        if (this.filter.value.sort != 2) pars['sort'] = this.filter.value.sort;
        if (this.filter.value.state && this.state < 0) pars['state'] = this.filter.value.state;
        if (this.filter.value.nsfw !== 2) pars['nsfw'] = this.filter.value.nsfw;

        const query = Object.keys(pars).map(t => `${t}=${pars[t]}`).join('&');
        const uri = this.states.find(t => t.index === this.filter.value.state)?.routes || '/search/all';
        return `${uri}?${query}`;
    }

    /**
     * Executes a POST request to the search endpoint with the filters
     * @param reset Whether or not to clear the current results or append to them
     * @returns Promise<void>
     */
    async fetch(reset: boolean = false) {
        if (this.pending.value) return;

        if (reset){
            this.results.value.results = [];
            this.results.value.pages = 0;
            this.results.value.count = 0;
        }

        this.pending.value = true;
        const { data: results } = await mangaApi.search({...this.filter.value}, false);
        this.pending.value = false;
        if (!results.value) return;

        const unbound = {...results.value};

        this.results.value.pages = unbound?.pages;
        this.results.value.count = unbound?.count;
        this.results.value.results = [...this.results.value.results, ...unbound.results];
    }

    /**
     * Determines the inclusion state of the given tag
     * @param tag The name of the tag
     * @returns Whether the tag is included (include), excluded (exclude), or has no state (none)
     */
    tagState(tag: string) {
        if (this.filter.value.include.indexOf(tag) !== -1) return 'include';
        if (this.filter.value.exclude.indexOf(tag) !== -1) return 'exclude';
        return 'none';
    }

    /**
     * Determines the material icon for the current state
     * @param tag The name of the tag
     * @returns The material icon name
     */
    tagIcon(tag: string) {
        const state = this.tagState(tag);
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
    tagToggle(tag: string) {
        const state = this.tagState(tag);

        const ii = this.filter.value.include.indexOf(tag);
        const ei = this.filter.value.exclude.indexOf(tag);

        switch(state) {
            case 'include': 
                if (ii !== -1) this.filter.value.include.splice(ii, 1);
                if (ei === -1) this.filter.value.exclude = [...this.filter.value.exclude, tag];
                break;
            case 'exclude':
                if (ii !== -1) this.filter.value.include.splice(ii, 1);
                if (ei !== -1) this.filter.value.exclude.splice(ei, 1);
                break;
            case 'none':
                if (ii === -1) this.filter.value.include = [...this.filter.value.include, tag];
                if (ei !== -1) this.filter.value.exclude.splice(ei, 1);
                break;
        }
    }

    /**
     * To be run during the setup life-cycle hook within Nuxt
     */
    async onSetup() {
        this.state = this.determineState();
        this.filter.value = this.routeFilter();

        const { data: filters } = await mangaApi.filters();
        this.filters.value = filters.value;

        await this.fetch(true);
    }
}