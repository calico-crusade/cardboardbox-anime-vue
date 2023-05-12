<template>
<Loading v-if="!currentUser" />
<div v-else class="user-card fill-parent flex row scroll-y center-items">
    <div class="card rounded fill flex row pad" :style="{ 'background-image': bg }">
        <div class="account flex center-items">
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
        <div class="settings fill flex row">
            <h1>Settings</h1>
            <div class="control">
                <label>Theme</label>
                <select v-model="theme">
                    <option v-for="(theme, index) in themes" :value="index">
                        {{ theme.name }}
                    </option>
                </select>
            </div>
            <div class="control checkbox">
                <CheckBox v-model="blurPornCovers">Blur Pornographic Cover Art</CheckBox>
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
    </div>
</div>
</template>

<script setup lang="ts">
const { currentUser } = useAuthApi();
const { 
    bgImageDir, 
    bgImageColors,
    resetBgImage,
    fixBgImage,
    themes,
    blurPornCovers
} = useAppSettings();

useHead({ title: 'Your account! Checking yourself out?' });

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
.user-card {
    .card {
        max-width: min(100vw, 1050px);
        margin: 10px;

        .account {
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

        .settings {
            .header {
                margin-top: 10px;
            }

            footer {
                margin-top: 10px;

                button:not(:first-child) {
                    margin-left: 10px;
                }
            }
        }
    }
}
</style>