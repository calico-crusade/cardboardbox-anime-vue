export const useAppSettings = () => {
    const config = useRuntimeConfig();

    const getStore = (key: string) => {
        if (!process.client) return undefined;
        return localStorage.getItem(key) || undefined;
    };
    const setStore = (key: string, value?: string) => {
        if (!process.client) return;
        if (value) localStorage.setItem(key, value);
        else localStorage.removeItem(key);
    };

    const toComputed = (key: string, def?: string) => computed({
        get: () => getStore(key) ?? def,
        set: (value: string | undefined) => setStore(key, value)
    });

    const toComputedBool = (key: string) => computed({
        get: () => !!getStore(key),
        set: (value: boolean) => setStore(key, value ? '1' : undefined)
    });

    const toComputedNumber = (key: string, def: number) => computed({
        get: () => +(getStore(key) ?? def.toString()),
        set: (value: number) => setStore(key, value.toString())
    });

    return { 
        token: toComputed('AuthToken'),
        redirect: toComputed('RedirectUrl'),
        invertControls: toComputedBool('invert-controls'),
        scrollChap: toComputedBool('scroll-chapter'),
        brightness: toComputedNumber('manga-brightness', 70),
        scrollAmount: toComputedNumber('scroll-amount', 100),
        imageSize: toComputed('img-size', 'Fit to Height'),
        filter: toComputed('filter', 'blue-light'),
        progressBar: toComputed('progress-bar', 'left'),

        apiUrl: config.public.apiUrl,
        authUrl: config.public.authUrl,
        appId: config.public.appId
    };
}