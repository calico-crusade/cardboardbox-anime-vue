import { AuthResponse, AuthUser } from "./models";

class AuthApi {

    get currentUser() { return useState<AuthUser | undefined>('login-user', () => undefined); }
    get failureReason() { return useState<string | undefined>('login-failure', () => undefined); }

    async bump() {
        if (!process.client) return this.failureReason.value = 'Login is only client side.';

        if(this.currentUser.value) return undefined;

        if (!api.token) {
            this.currentUser.value = undefined;
            return this.failureReason.value = 'User is not logged in.';
        }

        const { data: me, error } = await this.me();
        if (error.value || !me.value) {
            this.currentUser.value = undefined;
            return this.failureReason.value = 'Couldn\'t fetch user profile.';
        }

        this.currentUser.value = {...me.value};
        return this.failureReason.value = undefined;
    }

    async resolve(code?: string) {
        if (!code) {
            return this.failureReason.value = 'Invalid login code.';
        }

        if (!process.client) {
            return this.failureReason.value = 'Login is only client side.';
        }

        this.failureReason.value = undefined;
        const { data: results, error } = await this.code(code);
        if (error.value || !results.value || results.value.error) {
            api.token = undefined;
            this.currentUser.value = undefined;
            console.error('Error occurred during login', { error: error.value, results: results.value });
            return this.failureReason.value = 'An error occurred during login! ' + results.value?.error;
        }

        api.token = results.value.token;
        return await this.bump();
    }

    login() {
        api.redirect = useRouter().currentRoute.value.fullPath;
        const returnUrl = window.location.protocol + '//' + window.location.host + '/auth';
        window.location.href = `${api.authUrl}/Home/Auth/${api.appId}?redirect=${encodeURIComponent(returnUrl)}`;
    }

    logout() {
        api.token = undefined;
        this.currentUser.value = undefined;
        this.failureReason.value = undefined;
    }

    private code(code: string) { return api.get<AuthResponse>(`auth/${code}`); }

    private me() { return api.get<AuthUser>(`auth`); }
}

export const authApi = new AuthApi();