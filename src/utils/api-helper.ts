const STORAGE_TOKEN = 'AuthToken';

export function authFetch<T>(url: string, opts?: any) {
    const token = getToken();
    return useFetch<T>(apiUrl(url), {
        ...(opts || {}),
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export function apiUrl(url: string) {
    if (url.indexOf('https://') !== -1 ||
        url.indexOf('http://') !== -1) return url;

    if (url.startsWith('/')) url = url.substring(1);
    if (url.endsWith('?')) url = url.substring(0, url.length - 1);

    const config = useRuntimeConfig().public;
    return `${config.apiUrl}/${url}`;
}

export function getToken() {
    if (!process.client) return undefined;
    return localStorage.getItem(STORAGE_TOKEN);
}

export function setToken(token?: string) {
    if (!process.client) return;

    if (!token){
        localStorage.removeItem(STORAGE_TOKEN);
        return;
    }

    localStorage.setItem(STORAGE_TOKEN, token);
}