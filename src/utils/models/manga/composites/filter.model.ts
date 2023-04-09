export interface MangaFilter {
    page: number;
    size: number;
    search?: string;
    asc: boolean;
    include: string[];
    exclude: string[];
    sort?: number;
    state?: number;
    nsfw?: number;
}
