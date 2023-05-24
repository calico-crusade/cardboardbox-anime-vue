<template>
<div class="max-width">
    <Tabs>
        <Tab title="Settings" icon="settings" scrollable keep-alive>
            <div class="flex row">
                <div class="control checkbox">
                    <CheckBox v-model="blurPornCovers">
                        Blur Pornographic Cover Art
                    </CheckBox>
                </div>
                <div class="control checkbox">
                    <CheckBox v-model="invertControls">
                        Invert Page Direction Controls
                    </CheckBox>
                </div>
                <div class="control checkbox">
                    <CheckBox v-model="forwardOnly">
                        No Directional Buttons
                    </CheckBox>
                </div>
                <div class="control checkbox">
                    <CheckBox v-model="showTutorial">
                        Show Page Tutorial
                    </CheckBox>
                </div>
                <div class="control">
                    <label class="no-bot">Progress Bar Style</label>
                    <SelectBox v-model="progressBar">
                        <option 
                            v-for="style in PROGRESS_BAR_STYLES" 
                            :value="style"
                        >
                            {{ style }}
                        </option>
                    </SelectBox>
                </div>
                <div class="control">
                    <label class="no-bot">Scroll amount on key event</label>
                    <input 
                        type="number" 
                        min="0" 
                        max="1000" 
                        step="10" 
                        v-model="scrollAmount" 
                    />
                </div>
                <div class="control">
                    <label class="no-bot">Image Style</label>
                    <SelectBox v-model="pageStyle">
                        <option v-for="style in PAGE_STYLES" :value="style">
                            {{ style }}
                        </option>
                    </SelectBox>
                </div>
                <div class="control">
                    <label class="no-bot">Image Filter</label>
                    <SelectBox v-model="filter">
                        <option v-for="style in FILTER_STYLES" :value="style">
                            {{ style }}
                        </option>
                    </SelectBox>
                </div>
                <div class="control" v-if="filter === FilterStyle.Custom">
                    <label class="no-bot">Custom Filter</label>
                    <input 
                        type="text" 
                        v-model="customFilter" 
                        placeholder="Custom CSS filter" 
                    />
                </div>
                <div class="control">
                    <label class="no-bot">
                        Image Brightness ({{ brightness }}%)
                    </label>
                    <input type="range" min="1" max="100" v-model="brightness" />
                </div>
                <div class="control">
                    <label class="no-bot">Reader Style</label>
                    <SelectBox v-model="listStyle">
                        <option v-for="style in LIST_STYLES" :value="style">
                            {{ style }}
                        </option>
                    </SelectBox>
                </div>
            </div>
        </Tab>
        <Tab title="Themes" icon="palette" scrollable keep-alive>
            <div class="settings pad rounded" :style="{ 'background-image': bg }">
                <h2>System Themes</h2>
                <div class="control">
                    <label>Theme</label>
                    <SelectBox v-model="theme">
                        <option v-for="(theme, index) in themes" :value="index">
                            {{ theme.name }}
                        </option>
                    </SelectBox>
                </div>
                <h2>Custom Theme</h2>
                <div class="control">
                    <label>Background Gradient Direction</label>
                    <SelectBox v-model="direction">
                        <option v-for="dir in directions" :value="dir">
                            {{ dir }}
                        </option>
                    </SelectBox>
                </div>
                <div class="control" v-if="direction === 'deg'">
                    <label>Background Gradient Radius</label>
                    <input 
                        type="number" 
                        v-model="degrees" 
                        max="360" min="-360" step="10" 
                    />
                </div>
                <div class="flex center-items header">
                    <h2 class="fill">Gradient Colors</h2>
                    <button @click="newColor">
                        <Icon>add</Icon>
                    </button>
                </div>
                <ColorPicker 
                    v-for="(color, index) in colors"
                    v-model="color.color"
                    :label="'Gradient Color #' + (index + 1)"
                    @delete="() => deleteColor(index)"
                    @move="(inc) => move(index, inc)"
                />
                <footer class="flex">
                    <IconBtn
                        pad-left
                        @click="save"
                        icon="save"
                    />

                    <IconBtn
                        @click="reset"
                        icon="sync"
                    />
                </footer>
            </div>
        </Tab>
    </Tabs>
</div>
</template>

<script setup lang="ts">
import { 
    PROGRESS_BAR_STYLES, 
    PAGE_STYLES, 
    FILTER_STYLES,
    FilterStyle,
    LIST_STYLES
} from '~/models';

const { 
    resetBgImage,
    fixBgImage,
    commit,
    pauseUpdates,

    bgImageDir, 
    bgImageColors,
    themes,
    blurPornCovers,

    invertControls,
    forwardOnly,
    brightness,
    scrollAmount,
    pageStyle,
    progressBarStyle: progressBar,
    listStyle,
    showTutorial,
    filterStyle: filter,
    customFilter
} = useAppSettings();

useHead({ title: 'Configure the reader your way.' });

const themeIndex = ref(0);

const direction = ref<string>(bgImageDir.value);
const degrees = ref(90);
const colors = ref<{ color: string }[]>([]);
const theme = computed({
    get: () => themeIndex.value,
    set: (index: number) => {
        const value = themes[index];
        themeIndex.value = index;
        direction.value = value.direction;
        colors.value = value.colors.map(t => { return { color: t } });
    }
})

const directions = ['to right bottom', 'to right top', 'to left bottom', 'to left top', 'deg'];

const bg = computed(() => `linear-gradient(${(direction.value === 'deg' ? degrees.value + 'deg' : direction.value)}, ${colors.value.map(t => t.color).join(', ')})`);

const deleteColor = (index: number) => {
    colors.value.splice(index, 1);
};

const newColor = () => {
    colors.value.push({ color: '#ffffff' });
}

const save = () => {
    pauseUpdates.value = true;
    bgImageColors.value = colors.value.map(t => t.color);
    bgImageDir.value = direction.value === 'deg' ? `${degrees.value}deg` : direction.value;
    fixBgImage()
    pauseUpdates.value = false;
    commit();
}

const reset = () => {
    resetBgImage();
    rebind();
}

const rebind = () => {
    const dir = bgImageDir.value ?? '';
    if (dir.endsWith('deg')) {
        direction.value = 'deg';
        degrees.value = +dir.substring(0, dir.length - 3);
    } else direction.value = dir;

    colors.value = bgImageColors.value.map(t => {
        return { color: t }
    });
};

const move = (index: number, increment: number) => {
    let next = index + increment;
    if (next < 0) next = colors.value.length - 1;
    if (next >= colors.value.length) next = 0;
    if (next === index) return;

    [colors.value[index], colors.value[next]] = [colors.value[next], colors.value[index]];
}

onMounted(() => {
    rebind();
});
</script>

<style lang="scss" scoped>
.settings {
    h2:not(:first-child), .header, footer {
        margin-top: var(--margin);
    }

    footer {
        button:not(:first-child) {
            margin-left: 5px;
        }
    }
}
</style>