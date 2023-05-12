<template>
<Loading v-if="!currentUser" />
<div v-else class="max-width">
    <Tabs>
        <Tab title="Settings" icon="settings" scrollable keep-alive>
            <div class="flex row">
                <div class="control checkbox">
                    <CheckBox v-model="blurPornCovers">Blur Pornographic Cover Art</CheckBox>
                </div>
                <div class="control checkbox">
                    <CheckBox v-model="invertControls">Invert Page Direction Controls</CheckBox>
                </div>
                <div class="control checkbox">
                    <CheckBox v-model="forwardOnly">No Directional Buttons</CheckBox>
                </div>
                <div class="control">
                    <label class="no-bot">Progress Bar Style</label>
                    <select v-model="progressBar">
                        <option v-for="style in PROGRESS_BAR_STYLES" :value="style">
                            {{ style }}
                        </option>
                    </select>
                </div>
                <div class="control">
                    <label class="no-bot">Scroll amount on key event</label>
                    <input type="number" min="0" max="1000" step="10" v-model="scrollAmount" />
                </div>
                <div class="control">
                    <label class="no-bot">Image Style</label>
                    <select v-model="pageStyle">
                        <option v-for="style in PAGE_STYLES" :value="style">
                            {{ style }}
                        </option>
                    </select>
                </div>
                <div class="control">
                    <label class="no-bot">Image Filter</label>
                    <select v-model="filter">
                        <option v-for="style in FILTER_STYLES" :value="style">
                            {{ style }}
                        </option>
                    </select>
                </div>
                <div class="control" v-if="filter === FilterStyle.Custom">
                    <label class="no-bot">Custom Filter</label>
                    <input type="text" v-model="customFilter" placeholder="Custom CSS filter" />
                </div>
                <div class="control">
                    <label class="no-bot">Image Brightness ({{ brightness }}%)</label>
                    <input type="range" min="1" max="100" v-model="brightness" />
                </div>
            </div>
        </Tab>
        <Tab title="Themes" icon="palette" scrollable keep-alive>
            <div class="settings pad rounded" :style="{ 'background-image': bg }">
                <h2>System Themes</h2>
                <div class="control">
                    <label>Theme</label>
                    <select v-model="theme">
                        <option v-for="(theme, index) in themes" :value="index">
                            {{ theme.name }}
                        </option>
                    </select>
                </div>
                <h2>Custom Theme</h2>
                <div class="control">
                    <label>Background Gradient Direction</label>
                    <select v-model="direction">
                        <option v-for="dir in directions" :value="dir">
                            {{ dir }}
                        </option>
                    </select>
                </div>
                <div class="control" v-if="direction === 'deg'">
                    <label>Background Gradient Radius</label>
                    <input type="number" v-model="degrees" max="360" min="-360" step="10" />
                </div>
                <div class="flex center-items header">
                    <h2 class="fill">Gradient Colors</h2>
                    <button @click="newColor">
                        <Icon>add</Icon>
                    </button>
                </div>
                <div class="control rounded pad bg-accent" v-for="(color, index) in colors">
                    <label>Gradient Color #{{ index + 1 }}</label>
                    <div class="group">
                        <input 
                            class="fill" 
                            type="color" 
                            v-model="color.color" 
                            :style="{ 'background-color': color.color }"
                        />
                        <button @click="() => deleteColor(index)">
                            <Icon>delete</Icon>
                        </button>
                    </div>
                </div>
                <footer class="flex">
                    <button class="pad-left icon-btn" @click="save">
                        <Icon>save</Icon>
                    </button>
                    <button class="icon-btn" @click="reset">
                        <Icon>sync</Icon>
                    </button>
                </footer>
            </div>
        </Tab>
    </Tabs>
</div>
</template>

<script setup lang="ts">
import { 
    PROGRESS_BAR_STYLES, PAGE_STYLES, FILTER_STYLES,
    FilterStyle 
} from '~/models';

const { currentUser } = useAuthApi();
const { 
    resetBgImage,
    fixBgImage,

    bgImageDir, 
    bgImageColors,
    themes,
    blurPornCovers,

    invertControls,
    forwardOnly,
    brightness,
    scrollAmount,
    pageStyle,
    progressBar,
    listStyle,
    showTutorial,
    filter,
    customFilter
} = useAppSettings();

useHead({ title: 'Configure the reader your way.' });

const themeIndex = ref(0);

const direction = ref<string | undefined>();
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
    bgImageColors.value = colors.value.map(t => t.color);
    bgImageDir.value = direction.value === 'deg' ? `${degrees.value}deg` : direction.value;
    fixBgImage()
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