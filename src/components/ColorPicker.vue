<template>
<div class="control rounded pad bg-accent">
    <label v-if="label">{{ label }}</label>
    <div class="group">
        <input 
            type="color"
            v-model="value"
            :style="{ 'background-color': value }" 
        />
        <input 
            type="text"
            class="fill"
            v-model="value"
            placeholder="Color" 
        />
        <button @click="paste">
            <Icon>content_paste</Icon>
        </button>
        <button @click="() => $emit('delete')">
            <Icon>delete</Icon>
        </button>
        <button @click="() => $emit('move', -1)">
            <Icon>arrow_upward</Icon>
        </button>
        <button @click="() => $emit('move', 1)">
            <Icon>arrow_downward</Icon>
        </button>
    </div>
</div>
</template>

<script setup lang="ts">
interface Props {
    modelValue: string;
    label?: string;
}

interface Emits {
    (e: 'update:modelValue', v: string): void;
    (e: 'delete'): void;
    (e: 'move', v: number): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const value = computed({
    get: () => props.modelValue,
    set: (value: string) => emits('update:modelValue', value)
});

const paste = async () => {
    const data = await navigator.clipboard.readText();
    if (data) value.value = data;
}
</script>

<style lang="scss" scoped>
input[type="color"] {
    width: 50px;
    margin: auto 5px;
    cursor: pointer;
}
</style>