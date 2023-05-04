import { AuthResponse, AuthUser } from "~/models";
import { useApiHelper } from "./api-helpers";
import { useAppSettings } from "./settings-helper";

export const useAuthApi = () => {
    const { get } = useApiHelper();
    const { authUrl, appId, token, redirect } = useAppSettings();
    const { currentRoute } = useRouter();

    const currentUser = useState<AuthUser | undefined>('login-user', () => undefined);
    const failureReason = useState<string | undefined>('login-failure', () => undefined);

    const me = () => get<AuthUser>(`auth`);
    const resCode = (code: string) => get<AuthResponse>(`auth/${code}`);

    const bump = async () => {
        if (!process.client) return failureReason.value = 'Login is only client side.';
        if (currentUser.value) return undefined;
        if (!token.value) {
            currentUser.value = undefined;
            return failureReason.value = 'User is not logged in.';
        }

        const { data: user, error } = await me();
        if (error.value || !user.value) {
            currentUser.value = undefined;
            return failureReason.value = 'Couldn\'t fetch user profile.';
        }

        currentUser.value = {...user.value};
        return failureReason.value = undefined;
    };

    const resolve = async (code?: string) => {
        if (!code) {
            return failureReason.value = 'Invalid login code.';
        }

        if (!process.client) {
            return failureReason.value = 'Login is only client side.';
        }

        failureReason.value = undefined;
        const { data: results, error } = await resCode(code);
        if (error.value || !results.value || results.value.error) {
            token.value = undefined;
            currentUser.value = undefined;
            console.error('Error occurred during login', { error: error.value, results: results.value });
            return failureReason.value = 'An error occurred during login! ' + results.value?.error;
        }

        token.value = results.value.token;
        return await bump();
    };

    const login = () => {
        redirect.value = currentRoute.value.fullPath;
        const returnUrl = window.location.protocol + '//' + window.location.host + '/auth';
        window.location.href = `${authUrl}/Home/Auth/${appId}?redirect=${encodeURIComponent(returnUrl)}`;
    };

    const logout = () => {
        token.value = undefined;
        currentUser.value = undefined;
        failureReason.value = undefined;
    };

    return {
        bump,
        resolve,
        login,
        logout,
        currentUser,
        failureReason
    }
};