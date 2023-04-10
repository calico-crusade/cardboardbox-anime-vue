<template>
    <div class="flex fill-parent">
        <div class="center flex error-comp">
            <img src="~/assets/error.gif" alt="An error gif" />
            <p><b>An error occurred!</b> {{ $route.query.error }}</p>
        </div>
    </div>
</template>

<style lang="scss">
    .error-comp {
        img { height: 75px; }
        p { margin: auto 10px; }
    }
</style>