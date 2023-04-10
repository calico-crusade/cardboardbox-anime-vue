const STORAGE_TOKEN = 'AuthToken';

class ApiService {

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

    get apiUrl() {
        if (this._apiUrl) return this._apiUrl;
        return useRuntimeConfig().public.apiUrl;
    }

    constructor(
        private _token?: string,
        private _apiUrl?: string
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

    post<T>(url: string, body: any, params?: { [key: string]: any }) {
        return $fetch<T>(this.wrapUrl(url), {
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
}

export const api = new ApiService();