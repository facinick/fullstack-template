const Events = {
    TEXT: 'TEXT',
    CHAT: 'CHAT',
}

type Keys = keyof typeof Events;
type SubscriptionEventType = typeof Events[Keys];

export { SubscriptionEventType };
export default Events;