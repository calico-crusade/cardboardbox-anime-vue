<template>
    <div class="app-fix flex">
        <aside class="flex">
            <NavBar />
        </aside>
        <main class="fill flex">
            <slot />
        </main>
    </div>
</template>

<style lang="scss">
    .app-fix {
        background-image: linear-gradient(to right bottom, #051937, #171228, #190a1a, #12040d, #000000);

        aside {
            overflow: hidden;
            position: relative;
            background-color: var(--bg-color-accent);
        }
    }
</style>