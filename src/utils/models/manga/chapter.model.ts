import { DbObject } from "../db-object.model";

export interface Chapter extends DbObject {
    mangaId: number;
    title: string;
    url: string;
    sourceId: string;
    ordinal: number;
    volume?: number;
    language: string;
    pages: string[];
    externalUrl?: string;

    attributes: {
        name: string;
        value: string;
    }[];
}