import { AsyncData } from "nuxt/app";
import { Manga, MangaWithChapters, ProgressExt, Chapter, Progress, Stats, Filter, Paginated, Filters } from "./models";

export type VolumeChapter = {
    read: boolean;
    versions: Chapter[];
    open: boolean;
    progress?: number;
} & Chapter;

export type Volume = {
    name?: number;
    collapse: boolean;
    chapters: VolumeChapter[];
};

class MangaApi {

    fetch(id: number): AsyncData<MangaWithChapters, Error>;
    fetch(id: string): AsyncData<MangaWithChapters, Error>;
    fetch(id: string | number) {
        return api.getLazy<MangaWithChapters>(`manga/${id}`);
    }
    
    random() {
        return api.getLazy<MangaWithChapters>(`manga/random`);
    }
    
    extended(id: number): AsyncData<ProgressExt, Error>;
    extended(id: string): AsyncData<ProgressExt, Error>;
    extended(id: string | number) {
        return api.get<ProgressExt>(`manga/${id}/extended`);
    }
    
    favourite(id: number) { return api.getLazy<boolean>(`manga/${id}/favourite`); }
    
    reload(manga: Manga): AsyncData<MangaWithChapters, Error>;
    reload(url: string): AsyncData<MangaWithChapters, Error>;
    reload(item: string | Manga) {
        if (typeof item !== 'string') item = item.url;
        return api.getLazy(`manga/load`, { url: item, force: true });
    }

    groupVolumes(chapters: Chapter[]): Volume[];
    groupVolumes(chapters: Chapter[], progress?: Progress): Volume[];
    groupVolumes(chapters: Chapter[], progress?: Progress, stats?: Stats): Volume[];
    groupVolumes(chapters: Chapter[], progress?: ProgressExt): Volume[];
    groupVolumes(chapters: Chapter[], p?: Progress | ProgressExt, s?: Stats) {
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

            let last = groups[groups.length - 1];
            if (groups.length === 0 || last.name !== chap.volume) {
                groups.push({ name: chap.volume, collapse: false, chapters: [ cur ] });
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

    search(filter: Filter | Ref<Filter>, lazy: boolean = true) {
        return api.post<Paginated<ProgressExt>>(`manga/search`, filter, undefined, lazy);
    }

    filters() { return api.get<Filters>(`manga/filters`); }
}

export const mangaApi = new MangaApi();