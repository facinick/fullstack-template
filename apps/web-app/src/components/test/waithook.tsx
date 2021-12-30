import { ApolloError } from '@apollo/client';

export interface WaitHookProps {
    wait: () => Promise<any>;
    loading: boolean;
    error: ApolloError | undefined;
    data: any | null | undefined
}

export function WaitHook(props: WaitHookProps) {

    const { error, data, loading, wait } = props;

    const onClick = (): void => {
        wait();
    }

    const getButtonText = (): string => {

        if (error) {
            return error.message;
        }

        if (loading) {
            return "loading";
        }

        if (data) {
            return String(data.waitsecuremut.timestamp);
        }

        return "click me";
    }

    return (<button disabled={loading} style={{ width: "auto", height: "auto" }} id="wait-mutation-button" onClick={onClick}>{getButtonText()}</button>);
}

export default WaitHook;