import { useForm } from 'react-hook-form';
import { AuthPayload, useLoginMutation, User } from '@fullstack/data-access';
import { authDataActions } from 'apps/web-app/src/store/auth-data.slice';
import { useDispatch } from 'react-redux';

const Label = {
    ID: "ID",
    PASSWORD: "Password",
    SUBMIT: "Sign up",
}

export interface LoginProps {
    Signup: (id: string, password: string) => Promise<void>
}

export function Signup(props: LoginProps) {
    const { register, handleSubmit } = useForm();

    const onSubmit = async (formInput: { id: string; password: string; }) => {
        const { id, password } = formInput;
        props.Signup(id, password);
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input
                    type="text"
                    placeholder={Label.ID}
                    {...register("id")}
                />
                <input
                    type="text"
                    placeholder={Label.PASSWORD}
                    {...register("password")}
                />
                <input
                    value={Label.SUBMIT}
                    type="submit"
                />
            </form>
        </>
    );
}

export default Signup;