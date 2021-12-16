import { Button } from "@mui/material";

export interface LogoutUiProps {
    logout: (logoutEveryOne?: boolean) => Promise<void>
}

export function Logout(props: LogoutUiProps) {
    const _logout = async () => {
        props.logout(true);
    };

    return (<Button onClick={_logout} id="logout">logout</Button>);
}

export default Logout;