<template>
<div class="chapter-content grid by-2">
    <span class="cell icon-text">
        <Icon v-if="read">done_all</Icon>
        <Icon v-if="chapter.id === progress?.mangaChapterId">
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
        <Date :date="chapter.createdAt.toString()" format="partial" />
    </span>
</div>
</template>

<script setup lang="ts">
import { Chapter, Progress } from 'models';


defineProps<{
    read: boolean;
    chapter: Chapter;
    progress?: Progress;
}>();

</script>

<style lang="scss" scoped>
.chapter-content {
    position: relative;
}
</style>