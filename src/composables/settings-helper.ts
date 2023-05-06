import { FilterStyle, PageStyle, ProgressBarStyle } from "~/models";
import { Theme } from "~/models/theme.model";

export const useAppSettings = () => {
    const config = useRuntimeConfig();

    const themes: Theme[] = [
        {
            name: 'Light Pink',
            direction: 'to right bottom',
            colors: ['#0260ed', '#9645d9', '#ce14db', '#9f0f9a', '#ff0040']
        }, {
            name: 'Dark',
            direction: 'to right bottom',
            colors: ['#1953aa', '#693594', '#57195c', '#1a10a0', '#171130']
        }
    ]

    function getStore<T>(key: string, def?: T) {
        if (!process.client) return def;
        return localStorage.getItem(key) ?? def;
    }

    function setStore<T>(key: string, value?: T) {
        if (!process.client) return;
        if (value) localStorage.setItem(key, (<any>value).toString());
        else localStorage.removeItem(key);
    }

    function getSet<T>(key: string, def?: T) {
        const item = ref(getStore<string>(key));

        return computed({
            get: () => item.value ?? (<any>def)?.toString(),
            set: (val: string | undefined) => {
                item.value = val;
                setStore(key, val);
            }
        });
    }
    
    const getSetBool = (key: string, def: boolean) => {
        const item = ref(!!(getStore(key) ?? def));
        return computed({
            get: () => item.value,
            set: (value: boolean) => {
                item.value = value;
                setStore(key, value ? '1' : undefined);
            }
        });
    };
    
    const getSetNumb = (key: string, def: number) => {
        const item = ref(+(getStore<string>(key)?.toString() ?? def.toString()));
        return computed({
            get: () => item.value,
            set: (value: number) => {
                item.value = value;
                setStore(key, value.toString());
            }
        })
    };

    const getSetArray = (key: string, def: string[]) => {
        const item = ref(
            getStore<string>(key)?.toString()?.split(',')?.map(t => t.trim()
        ) ?? def);
        return computed({
            get: () => item.value,
            set: (value: string[]) => {
                item.value = value;
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
        token: getSet('auth-token'),
        redirect: getSet('redirect-url'),
        invertControls: getSetBool('invert-controls', false),
        forwardOnly: getSetBool('manga-forward-only', false),
        brightness: getSetNumb('manga-brightness', 70),
        scrollAmount: getSetNumb('scroll-amount', 100),
        pageStyle: getSet<PageStyle>('image-size', PageStyle.SinglePageFit),
        filter: getSet<FilterStyle>('image-filter', FilterStyle.BlueLight),
        progressBar: getSet<ProgressBarStyle>('progress-bar', ProgressBarStyle.Left),
        customFilter: getSet('custom-filter'),
        menuOpen: getSetBool('manga-menu-open', false),

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