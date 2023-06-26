export const useSettingsHelper = () => {
    const config = useRuntimeConfig();

    function getStore<T>(key: string, def?: T) {
        if (!process.client) return def;
        return <T><any>localStorage.getItem(key) ?? def;
    }

    function setStore<T>(key: string, value?: T) {
        if (!process.client) return;
        if (value) localStorage.setItem(key, (<any>value).toString());
        else localStorage.removeItem(key);
    }

    function getSet<T>(key: string, def?: T, fn?: (val: T | undefined) => void) {
        const state = useState<T | undefined>(key, () => getStore<T>(key, def));

        return computed({
            get: () => state.value,
            set: (val: T | undefined) => {
                state.value = val;
                setStore(key, val);
                if (fn) fn(val);
            }
        });
    }

    function getSetJson<T>(key: string, def?: T, fn?: (val: T | undefined) => void) {
        const fromJson = () => {
            const val = getStore<string>(key);
            if (!val) return def;
            return <T>JSON.parse(val);
        };
        const toJson = (val: T | undefined) => {
            if (!val) return undefined;
            return JSON.stringify(val);
        }
        const state = useState<T | undefined>(key, () => fromJson());

        return computed({
            get: () => state.value,
            set: (val: T | undefined) => {
                state.value = val;
                setStore(key, toJson(val));
                if (fn) fn(val);
            }
        });
    }
    
    const getSetBool = (key: string, def: boolean, fn?: (val: boolean) => void) => {
        const state = useState<boolean>(key, () => !!(getStore(key) ?? def));
        return computed({
            get: () => state.value,
            set: (value: boolean) => {
                state.value = value;
                setStore(key, value ? '1' : undefined);
                if (fn) fn(value);
            }
        });
    };
    
    const getSetNumb = (key: string, def: number, fn?: (val: number) => void) => {
        const state = useState<number>(key, 
            () => +(getStore<string>(key)?.toString() ?? def.toString()));
        return computed({
            get: () => state.value,
            set: (value: number) => {
                state.value = value;
                setStore(key, value.toString());
                if (fn) fn(value);
            }
        })
    };

    const getSetArray = (key: string, def: string[], fn?: (val: string[]) => void) => {
        const state = useState<string[]>(key, 
            () => getStore<string>(key)
                ?.toString()
                ?.split(',')
                ?.map(t => t.trim()) ?? def);

        return computed({
            get: () => state.value,
            set: (value: string[]) => {
                state.value = value;
                setStore(key, value.join(', ').toString());
                if (fn) fn(value);
            }
        })
    }
    
    return { 
        token: getSet<string>('auth-token'),
        redirect: getSet<string>('redirect-url'),
        menuOpen: getSetBool('manga-menu-open', false),

        apiUrl: config.public.apiUrl,
        authUrl: config.public.authUrl,
        appId: config.public.appId,

        getSetBool,
        getSet,
        getSetNumb,
        getSetArray,
        getSetJson
    };
}