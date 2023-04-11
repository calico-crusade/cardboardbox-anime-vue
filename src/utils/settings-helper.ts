class SettingsHelper {

    get invertControls() { return !!this.get('invert-controls'); }
    set invertControls(value: boolean) { this.set('invert-controls', value ? '1' : undefined); }

    get imageSize() { return this.get('img-size', 'Fit to Height'); }
    set imageSize(value: string | undefined) { this.set('img-size', value); }

    get scrollChap() { return !!this.get('scroll-chapter'); }
    set scrollChap(value: boolean) { this.set('scroll-chapter', value ? '1' : undefined); }

    get filter() { return this.get('filter', 'blue-light'); }
    set filter(value: string | undefined) { this.set('filter', value); }

    get brightness() { return +(this.get('manga-brightness', '70') || '70'); }
    set brightness(value: number) { this.set('manga-brightness', value.toString()); }

    get progressBar() { return this.get('progress-bar', 'left'); }
    set progressBar(value: string | undefined) { this.set('progress-bar', value); }

    get scrollAmount() { return +(this.get('scroll-amount', '100') || '100'); }
    set scrollAmount(value: number) { this.set('scroll-amount', value.toString()); }

    private set(key: string, value?: string) {
        if (!process.client) return;
        if (value) localStorage.setItem(key, value);
        else localStorage.removeItem(key);
    }

    private get(key: string, starting?: string) {
        if (!process.client) return starting;
        return localStorage.getItem(key) || starting;
    }
}

export const settings = new SettingsHelper();