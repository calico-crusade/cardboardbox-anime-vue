<template>
    <ClientOnly>
        <span>{{ dt }}</span>
    </ClientOnly>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
const { dateFormatLocal, dateFormatMicro } = useApiHelper();

const { format, date } = defineProps<{
    format?: string,
    date?: string | Date
}>();

const dt = computed(() => {
    const d = (date ?? new Date()).toString();
    switch (format) {
        case 'full': return dateFormatMicro(d);
        case 'partial': return dateFormatLocal(d, true);
        default: return dayjs(date).format(format || 'YYYY-MM-DD HH:mm');
    }
});
</script>