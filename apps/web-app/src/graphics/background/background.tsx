interface Props {
    children?: React.ReactNode
}

export const Background = (props: Props) => (<div style={{ width: "100%", height: "100%", "position": "absolute", zIndex: 0 }} id="background">{props.children}</div>)