import { AsyncData } from "#app";
import { saveAs } from "file-saver";
import { useAppSettings } from "./settings-helper";

export type Params = { [key: string]: any; };

export const useApiHelper = () => {
    const { apiUrl, token } = useAppSettings();

    const wrapUrl = (url: string) => {
        if (url.toLowerCase().indexOf('https://') !== -1 || 
            url.toLowerCase().indexOf('http://') !== -1) return url;

        if (url.startsWith('/')) url = url.substring(1);
        if (url.endsWith('?')) url = url.substring(0, url.length - 1);

        return `${apiUrl}/${url}`;
    };

    const headers = () => {
        const t = token.value;
        if (!t) return undefined;
        return { 'Authorization': `Bearer ${t}` };
    };

    const proxy = (url: string, group: string = 'manga-page', referer?: string) => {
        const path = encodeURIComponent(url);
        let uri = `https://cba-proxy.index-0.com/proxy?path=${path}&group=${group}`;

        if (referer) uri += `&referer=${encodeURIComponent(referer)}`;

        return uri;
    }

    const clone = <T>(item: T) => <T>JSON.parse(JSON.stringify(item));

    function get<T>(url: string, params?: Params, lazy: boolean = false) {
        if (lazy) 
            return useLazyFetch<T>(wrapUrl(url), {
                params,
                headers: headers()
            });

        return useFetch<T>(wrapUrl(url), {
            params,
            headers: headers()
        });
    }

    function post<T>(url: string, body?: any, params?: Params, lazy: boolean = false) {
        if (lazy)
            return useLazyFetch<T>(wrapUrl(url), {
                params,
                headers: headers(),
                body,
                method: 'POST'
            });

        return useFetch<T>(wrapUrl(url), <any>{
            params,
            headers: headers(),
            body,
            method: 'POST'
        });
    }

    function put<T>(url: string, body?: any, params?: Params, lazy: boolean = false) {
        if (lazy)
            return useLazyFetch<T>(wrapUrl(url), {
                params,
                headers: headers(),
                body,
                method: 'PUT'
            });

        return useFetch<T>(wrapUrl(url), <any>{
            params,
            headers: headers(),
            body,
            method: 'PUT'
        });
    }

    function deletefn<T>(url: string, params?: Params, lazy: boolean = false) {
        if (lazy) 
            return useLazyFetch<T>(wrapUrl(url), {
                params,
                headers: headers(),
                method: 'DELETE'
            });

        return useFetch<T>(wrapUrl(url), <any>{
            params,
            headers: headers(),
            method: 'DELETE'
        });
    }

    function download(url: string, name?: string) {
        return fetch(url)
            .then(t => t.blob())
            .then(t => {
                saveAs(t, name);
            });
    }

    function onFinish<T>(request: AsyncData<T, any>, fn: (item?: T) => void, err?: (item: any) => void) {
        const { pending, data, error } = request;

        const resolve = () => {
            if (pending.value) return;

            if (error.value && err) {
                err(error);
                return;
            }

            fn(data.value ?? undefined);
        }

        resolve();

        watch(() => pending.value, () => resolve());
    }

    function toPromise<T>(request: AsyncData<T, any>): Promise<T | undefined> {
        return new Promise((resolve, reject) => {
            onFinish(request, (d) => resolve(d), (err) => reject(err));
        });
    }

    return {
        get,
        post,
        put,
        del: deletefn,
        proxy,
        download,
        onFinish,
        toPromise,
        clone
    }
}