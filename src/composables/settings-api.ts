import { WritableComputedRef } from "nuxt/dist/app/compat/capi";
import { FilterStyle, ListStyle, PageStyle, ProgressBarStyle, Theme } from "~/models";

interface MangaSettings {
    invertControls: boolean;
    forwardOnly: boolean;
    brightness: number;
    scrollAmount: number;
    pageStyle: PageStyle;
    filterStyle: FilterStyle;
    progressBarStyle: ProgressBarStyle;
    customFilter?: string;
    listStyle: ListStyle;
    blurPornCovers: boolean;
    showTutorial: boolean;
    showPorn: boolean;
    bgImageDir: string;
    bgImageColors: string[];
}

interface Settings {
    manga?: MangaSettings;
}

type MangaSettingsKey = {
    invertControls: WritableComputedRef<boolean>;
    forwardOnly: WritableComputedRef<boolean>;
    brightness: WritableComputedRef<number>;
    scrollAmount: WritableComputedRef<number>;
    pageStyle: WritableComputedRef<PageStyle>;
    filterStyle: WritableComputedRef<FilterStyle>;
    progressBarStyle: WritableComputedRef<ProgressBarStyle>;
    customFilter: WritableComputedRef<string | undefined>;
    listStyle: WritableComputedRef<ListStyle>;
    blurPornCovers: WritableComputedRef<boolean>;
    showTutorial: WritableComputedRef<boolean>;
    showPorn: WritableComputedRef<boolean>;
    bgImageDir: WritableComputedRef<string>;
    bgImageColors: WritableComputedRef<string[]>;
};

const DEFAULTS: MangaSettings = {
    invertControls: false,
    forwardOnly: false,
    brightness: 70,
    scrollAmount: 100,
    pageStyle: PageStyle.SinglePageFit,
    filterStyle: FilterStyle.BlueLight,
    progressBarStyle: ProgressBarStyle.Left,
    customFilter: undefined,
    listStyle: ListStyle.Expanded,
    blurPornCovers: true,
    showTutorial: true,
    showPorn: true,
    bgImageDir: 'to right bottom',
    bgImageColors: ['#1953aa', '#693594', '#57195c', '#1a10a0', '#171130']
}

export const useAppSettings = () => {
    const config = useRuntimeConfig();
    const { currentUser } = useAuthApi();
    const { post, debounce, clone } = useApiHelper();
    const { getSetBool, getSetNumb, getSet, getSetArray } = useSettingsHelper();
    const pauseUpdates = useState<boolean>(() => false);

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

    const settings = (() => {
        return <MangaSettingsKey>{
            invertControls: getSetBool('invert-controls', DEFAULTS.invertControls, () => commit()),
            forwardOnly: getSetBool('manga-forward-only', DEFAULTS.forwardOnly, () => commit()),
            brightness: getSetNumb('manga-brightness', DEFAULTS.brightness, () => commit()),
            scrollAmount: getSetNumb('scroll-amount', DEFAULTS.scrollAmount, () => commit()),
            pageStyle: getSet<PageStyle>('image-size', DEFAULTS.pageStyle, () => commit()),
            filterStyle: getSet<FilterStyle>('image-filter', DEFAULTS.filterStyle, () => commit()),
            progressBarStyle: getSet<ProgressBarStyle>('progress-bar', DEFAULTS.progressBarStyle, () => commit()),
            customFilter: getSet<string>('custom-filter', DEFAULTS.customFilter, () => commit()),
            listStyle: getSet<ListStyle>('list-style', DEFAULTS.listStyle, () => commit()),
            blurPornCovers: getSetBool('blur-porn-covers', DEFAULTS.blurPornCovers, () => commit()),
            showTutorial: getSetBool('show-read-tutorial', DEFAULTS.showTutorial, () => commit()),
            showPorn: getSetBool('show-porn', DEFAULTS.showPorn, () => commit()),
            bgImageDir: getSet<string>('bg-image-dir', DEFAULTS.bgImageDir, () => { commit(); fixBgImage(); }),
            bgImageColors: getSetArray('bg-image-colors', DEFAULTS.bgImageColors, () => { commit(); fixBgImage(); })
        }
    })();

    const fixBgImage = () => {
        if (!process.client) return;

        document.documentElement.style.setProperty(
            '--bg-image', 
            `linear-gradient(${settings.bgImageDir.value}, ${settings.bgImageColors.value.join(', ')})`
        );
    };

    const settingsFromUser = () => {
        if (!currentUser.value) return undefined;
        return <Settings>JSON.parse(currentUser.value.settings || '{}') ?? undefined;
    }

    const rawSettings = () => {
        const instance = <any>clone(DEFAULTS);
        Object.keys(instance)
            .forEach(t => instance[t] = (<any>settings)[t].value);
        return <MangaSettings>instance;
    }

    const commitDebounce = debounce<void>(() => {
        if (!currentUser.value || pauseUpdates.value) return;
        const current = settingsFromUser() ?? { manga: clone(DEFAULTS) };
        current.manga = rawSettings();
        const newSet = JSON.stringify(current);
        return post(`auth/settings`, { settings: newSet });
    }, 1000);

    const commit = () => commitDebounce();

    const injectSettings = () => {
        const raw = <any>settingsFromUser()?.manga;
        if (!raw) return;

        pauseUpdates.value = true;
        for(const key in settings) {
            const val = raw[key];
            if (val === undefined) continue;

            (<any>settings)[key].value = val;
        }

        fixBgImage();

        pauseUpdates.value = false;
    }

    const resetBgImage = () => {
        settings.bgImageDir.value = 'to right bottom';
        settings.bgImageColors.value = ['#1953aa', '#693594', '#57195c', '#1a10a0', '#171130' ];
        fixBgImage();
    }

    return {
        ...settings,

        themes,
        pauseUpdates,

        injectSettings,
        resetBgImage,
        fixBgImage,
        commit
    }
};