// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        head: {
            link: [
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
        '@/styles/styles.scss',
    ],
    runtimeConfig: {
        public: {
            apiUrl: 'https://cba-api.index-0.com',
            appId: 'fd9ea511-ad01-4ba4-ad3d-bc4dee7f53f6',
            authUrl: 'https://auth.index-0.com'
        }
    },
    components: [
        '~/components/general',
        '~/components'
    ],
    modules: [
        '@pinia/nuxt'
    ],
    imports: {
        dirs: [
            'composables/**'
        ]
    }
})
