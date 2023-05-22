import { Bookmark } from "../bookmark.model";
import { Chapter } from "../chapter.model";
import { Manga } from "../manga.model";

export interface MangaWithChapters {
    manga: Manga;
    chapters: Chapter[];
    bookmarks: Bookmark[];
    favourite: boolean;
}

