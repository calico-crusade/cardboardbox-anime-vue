<template>
<NuxtLink 
    v-if="chapter.versions.length === 0" 
    class="chapter" 
    :to="'/manga/' + id + '/' + chapter.id" 
    :class="{'active': chapter.read}"
>
    <div 
        class="progress" 
        v-if="chapter.progress" 
        :style="{'width': chapter.progress + '%'}"
    >
        <span>{{ chapter.progress.toFixed(2) + '%' }}</span>
    </div>
    <div class="chapter-content grid by-2">
        <span class="cell icon-text">
            <Icon v-if="chapter.read">done_all</Icon>
            <Icon v-if="chapter.id === stats?.progress?.mangaChapterId">auto_stories</Icon>
            <span v-if="chapter.volume">Vol. {{ chapter.volume }}&nbsp;</span>
            Ch. {{ chapter.ordinal }}
        </span>
        <span class="cell icon-text">{{ chapter.title }}</span>
        <span class="cell icon-text">
            <Icon>language</Icon>
            &nbsp;
            {{ chapter.language }}
        </span>
        <span class="cell icon-text">
            <Icon>schedule</Icon>
            &nbsp;
            <Date :date="chapter.createdAt.toString()" />
        </span>
    </div>
</NuxtLink>
<div v-else class="version-chapter">
    <div 
        class="progress" 
        v-if="chapter.progress" 
        :style="{'width': chapter.progress + '%'}"
    >
        <span>{{ chapter.progress.toFixed(2) + '%' }}</span>
    </div>
    <NuxtLink 
        class="chapter-root" 
        :to="'/manga/' + id + '/' + chapter.id" 
        :class="{'active': chapter.read}"
    >
        <div class="chapter-content grid by-2">
            <span class="cell icon-text">
                <Icon v-if="chapter.read">done_all</Icon>
                <Icon 
                    v-if="chapter.id === stats?.progress?.mangaChapterId"
                >
                    auto_stories
                </Icon>
                <span v-if="chapter.volume">Vol. {{ chapter.volume }}&nbsp;</span>
                Ch. {{ chapter.ordinal }}
            </span>
            <span class="cell icon-text">{{ chapter.title }}</span>
            <span class="cell icon-text">
                <Icon>language</Icon> {{ chapter.language }}
            </span>
            <span class="cell icon-text">
                <Icon>schedule</Icon>&nbsp;
                <Date :date="chapter.createdAt.toString()" />
            </span>
        </div>
    </NuxtLink>
    <div class="version-drawer" :class="{ open: chapter.open }">
        <div class="header grid by-2" @click="() => toggle()">
            <span class="cell icon-text">
                <Icon>layers</Icon>&nbsp;
                Other Versions: {{ chapter.versions.length }}
            </span>
            <span class="cell icon-text">
                <Icon>
                    {{ chapter.open 
                        ? 'expand_more' 
                        : 'expand_less' }}
                </Icon>
            </span>
        </div>
        <div class="version-content">
            <NuxtLink 
                v-for="ver in chapter.versions" 
                :to="'/manga/' + id + '/' + ver.id"
            >
                <div class="chapter-content grid by-2">
                    <span class="cell icon-text">
                        <Icon v-if="chapter.read">done_all</Icon>
                        <Icon 
                            v-if="ver.id === stats?.progress?.mangaChapterId"
                        >
                            auto_stories
                        </Icon>
                        <span v-if="ver.volume">Vol. {{ ver.volume }}&nbsp;</span>
                        Ch. {{ ver.ordinal }}
                    </span>
                </div>
            </NuxtLink>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { ProgressExt, VolumeChapter } from '~/models';

const props = defineProps<{
    chapter: VolumeChapter,
    id: string | number,
    stats?: ProgressExt
}>();

const toggle = () => {
    props.chapter.open = !props.chapter.open;
}
</script>

<style lang="scss" scoped>
$bg-color: var(--bg-color-accent);
.chapter, .version-chapter {
    padding: 15px;
    background-color: $bg-color;
    text-decoration: none;
    margin: 5px;
    position: relative;
    &:first-child { display: none; }

    .progress {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background-color: var(--color-secondary-dark);

        span {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--accent-1);
            border-radius: 50%;
        }
    }

    .chapter-content { position: relative; }

    .chapter-root {
        display: flex;
        flex-flow: column;
        position: relative;
        text-decoration: none;
        border-bottom: 1px solid #{$bg-color};
        padding-bottom: 5px;
    }

    .version-drawer {
        padding-top: 5px;
        border-top: 1px solid #{$bg-color};
        .header { cursor: pointer; }
        .version-content {
            transition: max-height 250ms;
            max-height: 0;
            overflow: hidden;
            margin: 0;

            .version-item { text-decoration: none; }
        }

        &.open {
            .version-content {
                max-height: 100px;
                overflow-y: auto;
            }
        }
    }

    &.resume { background-color: var(--accent-1); }
}
</style>