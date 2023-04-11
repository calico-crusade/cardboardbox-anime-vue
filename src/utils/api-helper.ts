const STORAGE_TOKEN = 'AuthToken';
const STORAGE_URL = 'RedirectUrl';

class ApiHelper {

    get token() { 
        if (this._token) return this._token;
        if (!process.client) return undefined;
        return localStorage.getItem(STORAGE_TOKEN) || undefined;
    }
    set token(token: string | undefined) { 
        this._token = token;
        if (!process.client) return;

        if (!token) localStorage.removeItem(STORAGE_TOKEN);
        else localStorage.setItem(STORAGE_TOKEN, token);
    }

    get redirect() { return localStorage.getItem(STORAGE_URL) || undefined; }
    set redirect(url: string | undefined) { 
        if (!url) localStorage.removeItem(STORAGE_URL);
        else localStorage.setItem(STORAGE_URL, url);
    }

    get apiUrl() { return this._apiUrl || useRuntimeConfig().public.apiUrl; }
    get authUrl() { return this._authUrl || useRuntimeConfig().public.authUrl; }
    get appId() { return this._appId || useRuntimeConfig().public.appId; }

    constructor(
        private _token?: string,
        private _apiUrl?: string,
        private _authUrl?: string,
        private _appId?: string
    ) {}

    private headers() {
        if (!this.token) return undefined;
        return { 'Authorization': `Bearer ${this.token}` };
    }

    private wrapUrl(url: string) {
        if (url.toLowerCase().indexOf('https://') !== -1 || 
            url.toLowerCase().indexOf('http://') !== -1) return url;

        if (url.startsWith('/')) url = url.substring(1);
        if (url.endsWith('?')) url = url.substring(0, url.length - 1);

        return `${this.apiUrl}/${url}`;
    }

    get<T>(url: string, params?: { [key: string]: any }) {
        return useFetch<T>(this.wrapUrl(url), {
            params,
            headers: this.headers()
        });
    }

    getLazy<T>(url: string, params?: { [key: string]: any }) {
        return useLazyFetch<T>(this.wrapUrl(url), {
            params,
            headers: this.headers()
        });
    }

    post<T>(url: string, body: any, params?: { [key: string]: any }, lazy: boolean = false) {
        if (lazy)
            return useLazyFetch<T>(this.wrapUrl(url), {
                params,
                headers: this.headers(),
                body,
                method: 'POST'
            });

        return useFetch<T>(this.wrapUrl(url), <any>{
            params,
            headers: this.headers(),
            body,
            method: 'POST'
        });
    }

    put<T>(url: string, body: any, params?: { [key: string]: any }) {
        return $fetch<T>(this.wrapUrl(url), {
            params,
            headers: this.headers(),
            body,
            method: 'PUT'
        });
    }

    delete<T>(url: string, params?: { [key: string]: any }) {
        return $fetch<T>(this.wrapUrl(url), {
            params,
            headers: this.headers(),
            method: 'DELETE'
        });
    }

    proxyUrl(url: string, group: string = 'manga-page', referer?: string) {
        const path = encodeURIComponent(url);
        let uri = `https://cba-proxy.index-0.com/proxy?path=${path}&group=${group}`;

        if (referer) uri += `&referer=${encodeURIComponent(referer)}`;

        return uri;
    }
}

export const api = new ApiHelper();