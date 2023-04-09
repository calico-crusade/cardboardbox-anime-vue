<template>
    <div class="markdown" v-html="markdown"></div>
</template>

<script setup>
    import * as marked from 'marked';
    import * as hljs from 'highlight.js';

    const { content } = defineProps({ content: String });

    let markdown = '';

    marked.setOptions({
        highlight: (code, lang) => {
            return hljs.default.highlight(lang, code).value;
        }
    });

    markdown = marked.parse(content || '');
    
</script>