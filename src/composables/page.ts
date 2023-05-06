import { Bookmark, MangaWithChapters, ProgressExt } from "~/models";
import { FetchError } from 'ofetch';

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
    name: 'left' | 'right' | 'top' | 'bottom' | 'center';
}

export const usePageService = () => {
    const route = useRoute();
    const { proxy, toPromise, clone } = useApiHelper();
    const { 
        pages, 
        fetch, 
        extended, 
        progress, 
        resetPages: reset,
        bookmark
    } = useMangaApi();

    const cacheManga = useState<MangaWithChapters | undefined>('cache-page-manga', () => undefined);
    const cacheStats = useState<ProgressExt | undefined>('cache-page-stats', () => undefined);

    const DEFAULT_IMAGE = '/broken.png';

    const page = computed(() => +(route.query.page?.toString() || '1'));
    const chapterId = computed(() => +(route.params.chapter?.toString() || '0'));
    const id = computed(() => route.params.id.toString());
    const data = ref<MangaWithChapters | undefined>();
    const pending = ref(false);
    const bookmarking = ref(false);
    const external = computed(() => chapter.value?.externalUrl);
    const error = ref<FetchError<any> | undefined>();
    const manga = computed(() => data.value?.manga);
    const chapters = computed(() => data.value?.chapters || []);
    const chapter = computed(() => chapters.value.find(t => t.id === chapterId.value));
    const pageUrls = computed(() => {
        if (!manga.value || !chapter.value) return [];
        return chapter.value.pages.map(t => proxy(t, 'manga-page', manga.value?.referer));
    });
    const pageUrl = computed(() => pageUrls.value[page.value - 1] || DEFAULT_IMAGE);
    const title = computed(() => `${manga.value?.title} | Ch. ${chapter.value?.ordinal}`);
    const stats = ref<ProgressExt | undefined>();
    const bookmarks = computed(() => data.value?.bookmarks || []);

    const nextPageImage = computed(() => pageUrls.value[page.value] || DEFAULT_IMAGE);

    const chapterIndex = computed(() => {
        if (!manga.value || !chapter.value) return -1;
        return chapters.value.findIndex(a => a.id === chapter.value?.id);
    });

    const hasNextChapter = computed(() => {
        if (!manga.value || !chapter.value) return false;
        let c = chapterIndex.value;
        return !!chapters.value[c + 1];
    });

    const hasNextPage = computed(() => {
        if (!manga.value || !chapter.value) return false;
        return !!chapter.value.pages[page.value] || hasNextChapter.value;
    });

    const hasPreviousChapter = computed(() => {
        if (!manga.value || !chapter.value) return false;
        let c = chapterIndex.value;
        return !!chapters.value[c - 1];
    });

    const hasPreviousPage = computed(() => {
        if (!manga.value || !chapter.value) return false;
        return !!chapter.value.pages[page.value - 2] || hasPreviousChapter.value;
    });

    const hasNextPageAbsolute = computed(() => {
        if (!manga.value || !chapter.value) return false;
        return !!chapter.value.pages[page.value];
    });

    const hasPrevPageAbsolute = computed(() => {
        if (!manga.value || !chapter.value) return false;
        return !!chapter.value.pages[page.value - 2]
    });

    const fetchManga = (force: boolean) => {
        const m = cacheManga.value;
        if (!force && m && 
            (m.manga?.id.toString() === id.value || m.manga?.hashId == id.value) && 
            (cacheStats.value?.manga?.id.toString() === id.value || cacheStats.value?.manga.hashId === id.value)) {
            stats.value = cacheStats.value;
            return cacheManga.value;
        }

        if (!id.value) return undefined;

        const { data: ma, error: er } = fetch(id.value);
        const { data: st, error: sr } = extended(id.value);

        cacheManga.value = ma.value ?? undefined;
        stats.value = cacheStats.value = st.value ?? undefined;
        error.value = er.value ?? sr.value ?? undefined;
        return clone(ma.value);
    }

    const doFetch = (force: boolean = false) => {
        //Don't refetch if we're in the middle of fetching
        if (pending.value) return;

        //Set loading state to true
        pending.value = true;
        const ma = fetchManga(force);
        if (!ma) {
            pending.value = false;
            return;
        };

        data.value = ma;
        //Skip chapter resolution if we're missing data or we're external
        if (!manga.value || !chapter.value || external.value) {
            pending.value = false;
            return;
        }

        //Polyfill the chapters if needed.
        if (chapter.value.pages.length === 0) {
            const { data: outputPages } = pages(id.value, chapterId.value);
            chapter.value.pages = [...outputPages.value || []];
        }

        pending.value = false;

        if (chapter.value.pages.length === 0) return;

        if (page.value >= chapter.value.pages.length) {
            navigateTo(`/manga/${id.value}/${chapterId.value}?page=${chapter.value.pages.length}`);
            return;
        } 
        
        if (page.value <= 0) {
            navigateTo(`/manga/${id.value}/${chapterId.value}?page=1`);
            return;
        }

        if (process.client) {
            progress(manga.value.id, chapterId.value, page.value);
        }

    }

    const regions = (() => {
        const margin = 30;
        const w = (100 / 2) - (margin / 2);
        const regions: Rect[] = [
            { x: 0, y: 0, width: 100, height: w, name: 'top' },
            { x: 0, y: 100 - w, width: 100, height: w, name: 'bottom' },
            { x: 0, y: 0, width: w, height: 100, name: 'left' },
            { x: 100 - w, y: 0, width: w, height: 100, name: 'right' },
            { x: w, y: w, width: 100 - (w * 2), height: 100 - (w * 2), name: 'center' }
        ];

        return regions;
    })();

    const inRegion = (rect: DOMRect, mx: number, my: number) => {
        const output: ('top' | 'left' | 'bottom' | 'right' | 'center')[] = [];
        const x = (mx - rect.left) / rect.width * 100;
        const y = (my - rect.top) / rect.height * 100;

        for(let reg of regions) {
            if (x >= reg.x && x <= reg.x + reg.width &&
                y >= reg.y && y <= reg.y + reg.height)
                output.push(reg.name);
        }

        return output;
    };

    const mouseInRegion = (event: MouseEvent, target: HTMLElement) => {
        const rect = target.getBoundingClientRect();
        return inRegion(rect, event.clientX, event.clientY);
    };

    const resetPages = () => {
        pending.value = true;
        reset(id.value, chapterId.value);
        pending.value = false;
        doFetch(true);
    };

    const toggleBookmark = () => {
        if (!chapter.value) return;
        bookmarking.value = true;

        const pages = bookmarks.value
            .find(t => t.mangaChapterId === chapter.value?.id)?.pages || [];

        const i = pages.indexOf(page.value);
        if (i === -1) {
            pages.push(page.value);
        } else {
            pages.splice(i, 1);
        }

        bookmark(id.value, chapter.value.id, pages);
        doFetch(true);

        bookmarking.value = false;
    }

    return {
        page,
        chapterId,
        id,
        data,
        pending,
        external,
        manga,
        chapters,
        chapter,
        pageUrl,
        pageUrls,
        stats,
        title,
        error,
        nextPageImage,
        chapterIndex,
        hasNextChapter,
        hasNextPage,
        hasPreviousChapter,
        hasPreviousPage,
        hasPrevPageAbsolute,
        hasNextPageAbsolute,
        bookmarks,
        bookmarking,
        DEFAULT_IMAGE,

        regions,
        inRegion,
        mouseInRegion,
        resetPages,
        toggleBookmark,
        
        fetch: doFetch
    };
};