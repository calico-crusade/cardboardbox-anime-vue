<template>
    <div class="flex fill-parent">
        <div class="center flex error-comp">
            <img src="~/assets/error.gif" alt="An error gif" />
            <p><b>An error occurred!</b> {{ $props.message }}</p>
        </div>
    </div>
</template>

<script setup>
    defineProps({ message: String });
</script>

<style lang="scss">
    .error-comp {
        img { height: 75px; }
        p { margin: auto 10px; }
    }
</style>