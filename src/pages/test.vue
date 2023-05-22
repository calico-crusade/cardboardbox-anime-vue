<template>
    <div 
        class="fill-parent" 
        v-swipe 
        @swipe-left="() => swipe('left')"
        @swipe-right="() => swipe('right')"
        @swipe-up="() => swipe('up')"
        @swipe-down="() => swipe('down')"
        @tap="(ev: any) => swipe('tap', ev)"
        @click="onClick"
    >
        <h2>Hello world</h2>
    </div>
</template>

<script setup lang="ts">

const onClick = (ev: MouseEvent) => {
    console.log('On click', ev);
}

const swipe = (name: string, event?: any) => {
    console.log('Swiped', {
        name,
        event
    });
}
</script>