import { AsyncData } from "nuxt/app";
import { Manga, MangaWithChapters, ProgressExt } from "./models";

class MangaApi {
    fetch(id: number): AsyncData<MangaWithChapters, Error>;
    fetch(id: string): AsyncData<MangaWithChapters, Error>;
    fetch(id: string | number) {
        return useLazyFetch<MangaWithChapters>(apiUrl(`manga/${id}`));
    }
    
    random() {
        return useLazyFetch<MangaWithChapters>(apiUrl(`manga/random`));
    }
    
    extended(id: number): AsyncData<ProgressExt, Error>;
    extended(id: string): AsyncData<ProgressExt, Error>;
    extended(id: string | number) {
        return authFetch<ProgressExt>(`manga/${id}/extended`);
    }
    
    favourite(id: number) { return authFetch<boolean>(`manga/${id}/favourite`); }
    
    reload(manga: Manga): AsyncData<MangaWithChapters, Error>;
    reload(url: string): AsyncData<MangaWithChapters, Error>;
    reload(item: string | Manga) {
        if (typeof item !== 'string') item = item.url;
        return useLazyFetch<MangaWithChapters>(apiUrl(`manga/load`), { params: { url: item, force: true }});
    }
}

export const mangaApi = new MangaApi();