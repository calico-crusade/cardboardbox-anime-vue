import webManifest from "./webmanifest";

const baseUrl = 'https://manga.index-0.com';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    ssr: true,
    app: {
        head: {
            link: [
                { rel: 'manifest', href: '/manifest.webmanifest'},
                { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
                { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&amp;display=swap' },
                { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Kolker+Brush&display=swap' },
                { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons' },
                { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' },
            ],
            noscript: [
                { children: 'JavaScript is required' }
            ]
        },
        pageTransition: { name: 'page', mode: 'out-in' }
    },
    css: [
        '@/node_modules/highlight.js/styles/vs2015.css',
        '@/styles/variables.scss',
        '@/styles/reset.scss',
        '@/styles/styles.scss',
        '@/styles/layout.scss',
        '@/styles/controls.scss',
    ],
    runtimeConfig: {
        public: {
            apiUrl: 'https://cba-api.index-0.com',
            appId: 'fd9ea511-ad01-4ba4-ad3d-bc4dee7f53f6',
            authUrl: 'https://auth.index-0.com',
            baseUrl: baseUrl
        }
    },
    components: [
        '~/components/general',
        '~/components/general/tabs',
        '~/components/buttons',
        '~/components/volume-card',
        '~/components'
    ],
    modules: [
        '@pinia/nuxt',
        '@vite-pwa/nuxt'
    ],
    imports: {
        dirs: [
            'composables/**'
        ]
    },
    pwa: {
        registerType: 'autoUpdate',
        strategies: "generateSW",
        includeAssets: [], // do not precache all the JS, it's really stupid
        includeManifestIcons: false,
        manifest: webManifest({ baseUrl: baseUrl }),
        workbox: {
            navigateFallback: '/',
            globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        },
        client: {
            registerPlugin: true,
            installPrompt: true,
            periodicSyncForUpdates: 3600, // 1h, in seconds
        },
        devOptions: {
            enabled: true,
            navigateFallbackAllowlist: [/^\/$/],
            type: 'module',
        },
    }
})
