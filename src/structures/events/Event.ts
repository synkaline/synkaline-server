abstract class BaseEvent {
    abstract eventType: 'ws'|'http';
    abstract callback: (...args: any[]) => void|Promise<any>;
}

export default BaseEvent;