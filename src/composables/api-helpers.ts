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

    return {
        get,
        post,
        put,
        delete: deletefn,
        proxy
    }
}