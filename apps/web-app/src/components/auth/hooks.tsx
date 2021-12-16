import { useApolloClient } from "@apollo/client";
import { useLogoutMutation, useLoginMutation, useRefreshMutation, AuthPayload } from "@fullstack/data-access";
import { useDispatch } from "react-redux";
import { authDataActions } from "../../store/auth-data.slice";
import useAuthRefresh from "./refresh/refresh";

export interface useAuthProps { }
export interface useLoginProps { }

// export function useLogin(props: useLoginProps) {
//     const [loginMutation, { data, error, loading }] = useLoginMutation();
//     const dispatch = useDispatch();

//     const login = async (id: string, password: string) => {

//         await loginMutation({
//             variables: {
//                 id: id,
//                 password: password,
//             }
//         });

//         if (data) {
//             const authPaylaod = data.login as AuthPayload;
//             dispatch(authDataActions.login(authPaylaod));
//             console.log(`logged in`);
//             startService();
//         }
//     };

//     return [login, {data, error, loading}];
// }

export function useAuth(props: useAuthProps): [(id: string, password: string) => Promise<void>, (logoutEveryTab?: boolean) => Promise<void>, (_startService?: boolean) => Promise<void>, () => void, () => void] {

    const [logoutMutation, { data, loading, error }] = useLogoutMutation();
    const [loginMutation] = useLoginMutation();
    const [refreshMutation] = useRefreshMutation();


    const client = useApolloClient();

    const dispatch = useDispatch();

    const logout = async (logoutEveryTab?: boolean) => {
        dispatch(authDataActions.loading({ loading: 'loading' }));

        try {
            stopService();
            await logoutMutation();
            await client.resetStore();
            dispatch(authDataActions.logout());
            if (logoutEveryTab) {
                window.localStorage.setItem('logout', String(Date.now()));
            }
            dispatch(authDataActions.loading({ loading: 'loaded' }));
        } catch (error) {
            dispatch(authDataActions.loading({ loading: 'error' }));
        }

    };

    const login = async (id: string, password: string) => {
        dispatch(authDataActions.loading({ loading: 'loading' }));

        try {
            const { data } = await loginMutation({
                variables: {
                    id: id,
                    password: password,
                }
            });

            if (data) {
                const authPaylaod = data.login as AuthPayload;
                dispatch(authDataActions.login(authPaylaod));
                console.log(`logged in`);
                startService();
                dispatch(authDataActions.loading({ loading: 'loaded' }));
            } else {
                dispatch(authDataActions.loading({ loading: 'error' }));
            }
        } catch (error) {
            dispatch(authDataActions.loading({ loading: 'error' }));
        }

    };

    const onRefreshError = () => {
        logout(true);
    }

    const [startService, stopService] = useAuthRefresh({ intervalSeconds: 840, onError: onRefreshError });

    const refresh = async (_startService?: boolean) => {
        dispatch(authDataActions.loading({ loading: 'loading' }));

        try {
            const { data } = await refreshMutation();

            if (data) {
                const authPaylaod = data.refresh as AuthPayload;
                dispatch(authDataActions.refresh(authPaylaod));

                if (_startService) {
                    startService();
                }
                dispatch(authDataActions.loading({ loading: 'loaded' }));
            } else {
                dispatch(authDataActions.loading({ loading: 'error' }));
            }
        } catch (error) {
            dispatch(authDataActions.loading({ loading: 'error' }));
        }

    }

    return [login, logout, refresh, startService, stopService];
}