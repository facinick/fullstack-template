import { BasicBlob } from "./basicblob";
import "./main.scss";

interface Props {
    children?: React.ReactNode
}
export const Main = (props: Props) => {


    return (
        <div id="main-blur">
            <div id="main">
                {props.children}

            </div >
            <BasicBlob />
        </div>
    )

}