import { 
    Chapter, Filter, Filters, 
    Manga, MangaWithChapters, Stats,
    Paginated, Progress, ProgressExt,
    VolumeChapter,
    Volume
} from "~/models";
import { useApiHelper } from "./api-helpers";

export const useMangaApi = () => {
    const { get, post } = useApiHelper();

    const fetch = (id: number | string) => get<MangaWithChapters>(`manga/${id}`, undefined, true);

    const random = () => get<MangaWithChapters>(`manga/random`, undefined, true);

    const extended = (id: number | string) => get<ProgressExt>(`manga/${id}/extended`);

    const favourite = (id: number) => get<boolean>(`manga/${id}/favourite`, undefined, true);

    const reload = (manga: Manga | string, lazy: boolean = true) => {
        if (typeof manga !== 'string') manga = manga.url;
        return get<MangaWithChapters>(`manga/load`, { url: manga, force: true }, lazy);
    };

    const pages = (id: string | number, chapter: number) => get<string[]>(`manga/${id}/${chapter}/pages`);

    const search = (filter: Filter | Ref<Filter>, lazy: boolean = true) => {
        return post<Paginated<ProgressExt>>(`manga/search`, filter, undefined, lazy);
    };

    const filters = () => get<Filters>(`manga/filters`);

    const groupVolumes = (chapters: Chapter[], p?: Progress | ProgressExt, s?: Stats) => {
        let progress = p ? ('manga' in p ? p.progress : p) : undefined;
        let stats = s || (p && 'manga' in p ? p.stats : undefined);
        
        let read = true;
        let groups: Volume[] = [];

        if (!progress) read = false;

        for(let chap of chapters) {
            if (read && chap.id === progress?.mangaChapterId) read = false;

            let cur: VolumeChapter = { read, ...chap, versions: [], open: false };

            if (chap.id === progress?.mangaChapterId)
                cur.progress = stats?.pageProgress;

            if (groups.length === 0) {
                groups.push({ name: chap.volume, collapse: false, chapters: [ cur ] });
                continue;
            }

            let last = groups[groups.length - 1];
            if (last.name !== chap.volume) {
                groups.push({ name: chap.volume, collapse: false, chapters: [ cur  ]});
                continue;
            }

            let lastChap = last.chapters[last.chapters.length - 1];
            if (lastChap.ordinal === chap.ordinal) {
                lastChap.versions.push(chap);

                if (cur.read && !lastChap.read) lastChap.read = read;
                if (cur.progress && !lastChap.progress) lastChap.progress = cur.progress;
                continue;
            }

            last.chapters.push(cur);
        }

        return groups;
    }

    return {
        fetch,
        random,
        extended,
        favourite,
        reload,
        pages,
        search,
        filters,
        groupVolumes
    };
};