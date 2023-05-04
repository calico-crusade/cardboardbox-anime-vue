export interface Filter {
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

export interface FilterDefintion {
    key: string;
    values: string[];
}

export type Filters = FilterDefintion[];