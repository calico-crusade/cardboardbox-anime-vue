<template>
<Loading v-if="!currentUser" />
<div v-else class="center user-card rounded bg-accent pad flex center-items">
    <img :src="currentUser.avatar" />
    <div class="details flex row fill">
        <div class="title">{{ currentUser.nickname }}</div>
        <div class="email"><b>Email: </b>{{ currentUser.email }}</div>
        <div class="tags in-line">
            <span>Roles:</span>
            <span v-for="role of currentUser.roles">{{ role }}</span>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
const { currentUser } = useAuthApi();
useHead({ title: 'Your account! Checking yourself out?' });
</script>

<style lang="scss" scoped>
.user-card {
    min-width: min(400px, 100vw);
    max-width: 100vw;
    img { 
        border-radius: 50%;
        max-width: 100px;
    }
    .details {
        margin-left: var(--margin);
        .title {
            font-weight: bold;
            margin-left: 3px;
            font-size: 24px;
        }

        .email { margin-left: 3px; }
    }
}
</style>