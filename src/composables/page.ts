import { MangaWithChapters } from "~/models";

export const usePageService = () => {
    const route = useRoute();
    const { pages, fetch } = useMangaApi();

    const DEFAULT_IMAGE = '~/assets/broken.png';

    const page = computed(() => +(route.query.page?.toString() || '1'));
    const chapterId = computed(() => +(route.params.chapter?.toString() || '0'));
    const id = computed(() => route.params.id.toString());
    const data = ref<MangaWithChapters | undefined>(undefined);
    const pending = ref(false);
    const external = computed(() => chapter.value?.externalUrl);

    const manga = computed(() => data.value?.manga);
    const chapters = computed(() => data.value?.chapters || []);
    const chapter = computed(() => chapters.value.find(t => t.id === chapterId.value));
    const pageUrl = computed(() => chapter.value?.pages[page.value - 1] || DEFAULT_IMAGE);
    const title = computed(() => `${manga.value?.title} | Ch. ${chapter.value?.ordinal}`);

    const nextPageImage = computed(() => {
        if (!manga.value || !chapter.value) return DEFAULT_IMAGE;
        return chapter.value.pages[page.value] || DEFAULT_IMAGE;
    });

    const chapterIndex = computed(() => {
        if (!manga.value || !chapter.value) return -1;
        return chapters.value.findIndex(a => a.id === chapter.value?.id);
    });

    const hasNextChapter = computed(() => {
        if (!manga.value || !chapter.value) return false;
        let c = chapterIndex.value;
        return c !== -1 && c + 1 >= 0 && c + 1 < chapters.value.length;
    });

    const hasNextPage = computed(() => {
        if (!manga.value || !chapter.value) return false;
        const p = page.value;
        if (p >= 0 && p < chapter.value.pages.length) return true;
        return hasNextChapter.value;
    });

    const hasPreviousChapter = computed(() => {
        if (!manga.value || !chapter.value) return false;
        let c = chapterIndex.value;
        return c !== -1 && c + 1 >= 0 && c + 1 < chapters.value.length;
    });

    const hasPreviousPage = computed(() => {
        if (!manga.value || !chapter.value) return false;
        const p = page.value - 2;
        return p >= 0 && p < chapter.value.pages.length;
    });

    const fetchManga = async (force: boolean) => {
        const m = manga.value;
        if (m && (m.id.toString() === id.value || m.hashId == id.value) && !force) return data.value;

        if (!id.value) return undefined;

        const { data: ma } = await fetch(id.value);
        return ma.value ? {...ma.value} : undefined;
    }

    const doFetch = async (force: boolean = false) => {
        //Don't refetch if we're in the middle of fetching
        if (pending.value) return;

        //Set loading state to true
        pending.value = true;
        const ma = await fetchManga(force);
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
            const { data: outputPages } = await pages(id.value, chapterId.value);
            chapter.value.pages = [...outputPages.value || []];
        }

        pending.value = false;
    }

    const doSetup = async() => {
        await doFetch(true);
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
        title,
        DEFAULT_IMAGE,

        nextPageImage,
        chapterIndex,
        hasNextChapter,
        hasNextPage,
        hasPreviousChapter,
        hasPreviousPage,
        
        fetch: doFetch,
        doSetup
    };
};