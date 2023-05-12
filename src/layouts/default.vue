<template>
    <div class="app-fix flex">
        <NavBar />
        <main class="fill flex">
            <slot />
        </main>
    </div>
</template>

<style lang="scss" scoped>
@media only screen and (max-width: 1050px) {
    .app-fix {
        flex-flow: column;

        main {
            overflow: hidden;
        }
    }
}
</style>