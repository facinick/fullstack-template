import { useForm } from 'react-hook-form';
import { Button, Input } from '@mui/material';

const Label = {
    ID: "ID",
    PASSWORD: "Password",
    SUBMIT: "Sign in",
}

export interface LoginProps {
    login: (id: string, password: string) => Promise<void>
}

export function Login(props: LoginProps) {
    const { register, handleSubmit } = useForm();

    const onSubmit = async (formInput: { id: string; password: string; }) => {
        const { id, password } = formInput;
        props.login(id, password);
    };

    const onError = (errors: any, e: any) => console.log(errors, e);

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <Input
                    type="text"
                    placeholder={Label.ID}
                    {...register("id")}
                />
                <Input
                    type="text"
                    placeholder={Label.PASSWORD}
                    {...register("password")}
                />
                <Button
                    disableElevation
                    variant="contained"
                    type="submit"
                >{Label.SUBMIT} </Button>
            </form>
        </>
    );
}

export default Login;