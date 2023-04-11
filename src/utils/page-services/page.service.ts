import { MangaWithChapters } from "../models";

const DEFAULT_IMAGE = '~/assets/broken.png';

export class PageService {

    data = ref<MangaWithChapters | undefined>(undefined);
    pending = ref(false);
    external = computed(() => this.chapter.value?.externalUrl);

    manga = computed(() => this.data.value?.manga);
    chapters = computed(() => this.data.value?.chapters || []);
    chapter = computed(() => this.chapters.value.find(t => t.id === this.chapterId));
    pageUrl = computed(() => this.chapter.value?.pages[this.page - 1] || DEFAULT_IMAGE);
    title = computed(() => `${this.manga.value?.title} | Ch. ${this.chapter.value?.ordinal}`);

    nextPageImage = computed(() => {
        if (!this.manga.value || !this.chapter.value) return DEFAULT_IMAGE;
        return this.chapter.value.pages[this.page] || DEFAULT_IMAGE;
    });

    chapterIndex = computed(() => {
        if (!this.manga.value || !this.chapter.value) return -1;
        return this.chapters.value.findIndex(a => a.id === this.chapter.value?.id);
    });

    hasNextChapter = computed(() => {
        if (!this.manga.value || !this.chapter.value) return false;
        let c = this.chapterIndex.value;
        return c !== -1 && c + 1 >= 0 && c + 1 < this.chapters.value.length;
    });

    hasNextPage = computed(() => {
        if (!this.manga.value || !this.chapter.value) return false;
        const p = this.page;
        if (p >= 0 && p < this.chapter.value.pages.length) return true;
        return this.hasNextChapter;
    });

    hasPreviousChapter = computed(() => {
        if (!this.manga.value || !this.chapter.value) return false;
        let c = this.chapterIndex.value;
        return c !== -1 && c + 1 >= 0 && c + 1 < this.chapters.value.length;
    });

    hasPreviousPage = computed(() => {
        if (!this.manga.value || !this.chapter.value) return false;
        const p = this.page - 2;
        return p >= 0 && p < this.chapter.value.pages.length;
    });

    get id() { return this._route.params.id.toString(); }
    get chapterId() { return +(this._route.params.chapter?.toString() || '0'); }
    get page() { return +(this._route.query.page?.toString() || '1'); }

    constructor(
        private _route: any
    ) { }

    proxy(url?: string) { return url ? api.proxyUrl(url, 'manga-page', this.manga.value?.referer) : DEFAULT_IMAGE; }

    async fetch(force: boolean = false) {
        //Don't refetch if we're in the middle of fetching
        if (this.pending.value) return;

        //Set loading state to true
        this.pending.value = true;
        const data = await this.fetchManga(force);
        if (!data) {
            this.pending.value = false;
            return;
        };

        this.data.value = data;
        //Skip chapter resolution if we're missing data or we're external
        if (!this.manga.value || !this.chapter.value || this.external.value) {
            this.pending.value = false;
            return;
        }

        //Polyfill the chapters if needed.
        if (this.chapter.value.pages.length === 0) {
            const { data: pages } = await mangaApi.pages(this.id, this.chapterId);
            this.chapter.value.pages = [...pages.value || []];
        }

        this.pending.value = false;
    }

    private async fetchManga(force: boolean): Promise<MangaWithChapters | undefined> {
        const m = this.manga.value;
        if (m && (m.id.toString() === this.id || m.hashId == this.id) && !force) return this.data.value;

        if (!this.id) return undefined;

        const { data } = await mangaApi.fetch(this.id);
        return data.value ? {...data.value} : undefined;
    }

    async onSetup() {
        await this.fetch(true);
    }
}