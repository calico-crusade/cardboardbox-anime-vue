import { FilterStyle, ListStyle, PageStyle, ProgressBarStyle, Theme } from "~/models";

export const useAppSettings = () => {
    const config = useRuntimeConfig();

    const themes: Theme[] = [
        {
            name: 'Dark',
            direction: 'to right bottom',
            colors: ['#1953aa', '#693594', '#57195c', '#1a10a0', '#171130']
        },
        {
            name: 'Light Pink',
            direction: 'to right bottom',
            colors: ['#0260ed', '#9645d9', '#ce14db', '#9f0f9a', '#ff0040']
        },
    ]

    function getStore<T>(key: string, def?: T) {
        if (!process.client) return def;
        return <T><any>localStorage.getItem(key) ?? def;
    }

    function setStore<T>(key: string, value?: T) {
        if (!process.client) return;
        if (value) localStorage.setItem(key, (<any>value).toString());
        else localStorage.removeItem(key);
    }

    function getSet<T>(key: string, def?: T) {
        const state = useState<T | undefined>(key, () => getStore<T>(key, def));

        return computed({
            get: () => state.value,
            set: (val: T | undefined) => {
                state.value = val;
                setStore(key, val);
            }
        });
    }
    
    const getSetBool = (key: string, def: boolean) => {
        const state = useState<boolean>(key, () => !!(getStore(key) ?? def));
        return computed({
            get: () => state.value,
            set: (value: boolean) => {
                state.value = value;
                setStore(key, value ? '1' : undefined);
            }
        });
    };
    
    const getSetNumb = (key: string, def: number) => {
        const state = useState<number>(key, () => +(getStore<string>(key)?.toString() ?? def.toString()));
        return computed({
            get: () => state.value,
            set: (value: number) => {
                state.value = value;
                setStore(key, value.toString());
            }
        })
    };

    const getSetArray = (key: string, def: string[]) => {
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
            }
        })
    }
    const bgImageDir = getSet('bg-image-dir', 'to right bottom');
    const bgImageColors = getSetArray('bg-image-colors', ['#1953aa', '#693594', '#57195c', '#1a10a0', '#171130']);

    const fixBgImage = () => {
        if (!process.client) return;

        document.documentElement.style.setProperty('--bg-image', `linear-gradient(${bgImageDir.value}, ${bgImageColors.value.join(', ')})`);
    };

    const resetBgImage = () => {
        bgImageDir.value = 'to right bottom';
        bgImageColors.value = ['#1953aa', '#693594', '#57195c', '#1a10a0', '#171130' ];
        fixBgImage();
    }

    return { 
        token: getSet<string>('auth-token'),
        redirect: getSet<string>('redirect-url'),
        invertControls: getSetBool('invert-controls', false),
        forwardOnly: getSetBool('manga-forward-only', false),
        brightness: getSetNumb('manga-brightness', 70),
        scrollAmount: getSetNumb('scroll-amount', 100),
        pageStyle: getSet<PageStyle>('image-size', PageStyle.SinglePageFit),
        filter: getSet<FilterStyle>('image-filter', FilterStyle.BlueLight),
        progressBar: getSet<ProgressBarStyle>('progress-bar', ProgressBarStyle.Left),
        customFilter: getSet<string>('custom-filter'),
        menuOpen: getSetBool('manga-menu-open', false),
        listStyle: getSet<ListStyle>('list-style', ListStyle.Expanded),
        blurPornCovers: getSetBool('blur-porn-covers', true),

        bgImageDir,
        bgImageColors,

        themes,
        apiUrl: config.public.apiUrl,
        authUrl: config.public.authUrl,
        appId: config.public.appId,

        fixBgImage,
        resetBgImage
    };
}