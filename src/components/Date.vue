<template>
    <span>{{ dt }}</span>
</template>

<script setup lang="ts">
    import dayjs from 'dayjs';
    
    const { format, date } = defineProps({ format: String, date: String });

    const dt = computed(() => dayjs(date).format(format || 'YYYY-MM-DD HH:mm'));
</script>