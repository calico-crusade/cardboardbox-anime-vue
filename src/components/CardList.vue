<template>
<div class="card-list" ref="scroller" @scroll="onScroll" :class="style">
    <div class="title flex center-items">
        <button class="back" @click="back">
            <Icon>arrow_back</Icon>
        </button>
        <h2 class="fill" :class="{ 'caps': capitalize }">{{ title }} ({{ items.length }})</h2>
        <div class="btn-group">
            <button 
                v-for="sty in styles"
                @click="() => style = sty.style"
                :class="{ 'active': sty.style === listStyle }"
            >
                <Icon>{{ sty.icon }}</Icon>
            </button>
        </div>
    </div>

    <header ref="stickyheader">
        <slot />
    </header>

    <div class="cards" :class="{ 'grid responsive': listStyle === ListStyle.Album }">
        <div class="card" v-for="item in items" >
            <Card :manga="item.manga" :search="item.search" />
        </div>
    </div>

    <div class="loading-card" v-if="pending">
        <Loading />
    </div>

    <div class="error-card " v-if="noresults && !items?.length && !pending">
        <div class="flex fill-parent">
            <div class="center flex center-items">
                <img src="/twirl.gif" alt="No results"/>
                <p class="pad">No Results</p>
            </div>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { 
    ProgressExt, Manga, 
    MatchResult, VisionResult, 
    BaseResult, ImageSearchManga, 
    ListStyle 
} from '~/models';
type MangaType = Manga | ProgressExt;
type SearchType = MatchResult | VisionResult | BaseResult | ImageSearchManga;

const { listStyle } = useAppSettings();
const stickyheader = ref<HTMLElement>();
const emits = defineEmits<{ 
    (e: 'onscrolled'): void;
    (e: 'headerstuck', value: boolean): void;
}>();
const scroller = ref<HTMLElement>();
const props = defineProps<{
    manga?: MangaType[] | null | undefined;
    search?: SearchType[] | null | undefined;
    pending?: boolean;
    noresults?: boolean;
    capitalize?: boolean;
    title: string;
}>();

const items = computed(() => {
    return [
        ...((props.manga ?? [])
            .map(t => { return { manga: t, search: undefined }})),
        ...((props.search ?? [])
            .map(t => { return { manga: undefined, search: t }}))
    ]
});

const style = computed<ListStyle>({
    get: () => listStyle.value,
    set: (value: ListStyle) => listStyle.value = value
});

const styles = [
    { icon: 'list', style: ListStyle.Compact },
    { icon: 'expand', style: ListStyle.Expanded },
    { icon: 'book', style: ListStyle.Album }
]

const onScroll = () => {
    const element = scroller.value;
    if (!element) return;
    
    const bottom = 
        element.scrollTop + element.clientHeight 
        >= element.scrollHeight;
    if (!bottom) return;

    emits('onscrolled');
}

const back = () => history.back();

onMounted(() => {
    const observer = new IntersectionObserver(
        ([e]) => { 
            e.target.toggleAttribute('stuck', e.intersectionRatio < 1);
            emits('headerstuck', e.intersectionRatio < 1);
        }, { threshold: 1 }
    );

    if (stickyheader.value) observer.observe(stickyheader.value);
})

</script>

<style lang="scss" scoped>
.card-list {
    position: relative;
    overflow-y: auto;
    width: 100%;
    max-height: 100%;
    padding: 0 var(--margin);

    .title, header, .cards, .error-card {
        max-width: min(98vw, 1050px);
        width: 100%;
        margin: 0 auto;
        margin-top: var(--margin);
    }

    .title {
        h2 {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: pre;

            &.caps { text-transform: capitalize; }
        }
    }

    header {
        position: sticky;
        top: -2px;
        z-index: 1;

        &[stuck] {
            padding-top: 5px;
        }
    }

    .cards {
        padding-bottom: var(--margin);
    }

    .error-card {
        display: flex;
        flex-flow: row;
        align-items: center;
        margin: auto;

        img { height: 80px; }
    }

    &.album {
        .cards {
            gap: .25rem;
            margin: 0 auto;

            .card {
                margin: 0;

                &:nth-child(3n+2) { margin: 0 auto; }
                &:nth-child(3n+3) { margin-left: auto; }
            }
        }
    }
}

@media only screen and (max-width: 900px) {
    .card-list.album .cards {
        grid-template-columns: repeat(2, minmax(0, 1fr));

        .card {
            margin: 0 !important;

            &:nth-child(2n+1) { margin-right: auto !important; }
            &:nth-child(2n+2) { margin-left: auto !important; }
        }
    }
}

@media only screen and (max-width: 600px) {
    .card-list.album .cards {
        grid-template-columns: repeat(1, minmax(0, 1fr));

        .card { margin: 0 auto !important; }
    }
}
</style>