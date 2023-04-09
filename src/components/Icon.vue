<template>
    <span class="material-symbols-outlined"
          :class="{ 'unsize': unsize, 'fill': fill, 'spin': spin }" :style="{'font-size': size }">
        <slot />      
    </span>
</template>

<script setup lang="ts">
    defineProps(['unsize', 'fill', 'spin', 'size' ]);
</script>

<style lang="scss">
    :host { display: flex; }

    .material-symbols-outlined {
        margin: auto 0;
        display: inline-block;
        fill: currentColor;
        height: 24px;
        width: 24px;
    }

    .unsize {
        height: unset;
        width: unset;
    }

    .spin {
        animation: spin 10s linear infinite;
    }

    @keyframes spin {
        100% {
            transform: rotate(360deg);
        }
    }
</style>