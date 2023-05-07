<template>
<div class="control no-top group center-items">
    <input type="file" class="file-input" accept="image/*" @change="selected" ref="fileinput" />
    <input type="text" class="fill" v-model="value" placeholder="Image URL or Manga Title" />
    <button @click="() => value = ''">
        <Icon unsize="true" size="12px">close</Icon>
    </button>
    <div class="sep" />
    <button @click="() => fileinput?.click()">
        <Icon unsize="true" size="26px">image</Icon>
    </button>
    <NuxtLink :to="wrapedUrl" :class="{ 'disabled': !wrapedUrl }">
        <Icon unsize="true" size="26px">search</Icon>
    </NuxtLink>
</div>
</template>

<script setup lang="ts">
interface Emits {
    (e: 'update:modelValue', value: string): void;
    (e: 'file', value: File): void;
}

interface Props {
    modelValue: string;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const fileinput = ref<HTMLElement>();

const value = computed({
    get: () => props.modelValue,
    set: (value: string) => emits('update:modelValue', value)
});

const wrapedUrl = computed(() => value.value ? `/reverse/${encodeURIComponent(value.value)}` : undefined);

const selected = (event: Event) => {
    if (!event?.target) return;

    const files: File[] = (<any>event.target).files;
    if (!files || files.length <= 0) return;

    const file = files[0];
    emits('file', file);
}

</script>

<style lang="scss" scoped>
.control {
    .file-input { display: none; }
    a, button {
        padding: 10px;
    }
}
</style>