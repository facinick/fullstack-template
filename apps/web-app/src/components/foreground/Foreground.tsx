interface Props {
    children?: React.ReactNode
}

export const Foreground = (props: Props) => (<div style={{ width: "100%", height: "100%", "position": "absolute", zIndex: 1 }} id="foreground">{props.children}</ div>)