<template>
    <span class="material-symbols-outlined"
          :class="{ 'unsize': unsize, 'fill': fill, 'spin': spin }" :style="{'font-size': size }">
        <slot />      
    </span>
</template>

<script setup lang="ts">defineProps(['unsize', 'fill', 'spin', 'size']);</script>

<style lang="scss">
    .material-symbols-outlined {
        margin: auto 0;
        display: inline-block;
        fill: currentColor;
        height: 24px;
        width: 24px;
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48;

        &.fill { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48; }
        &.unsize { height: unset; width: unset; }
        &.spin { animation: spin 10s linear infinite; }
    }
</style>