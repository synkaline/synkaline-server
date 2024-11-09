abstract class BaseEvent {
    abstract eventType: 'ws'|'http';
    abstract callback: (...args: any[]) => void;
}

export default BaseEvent;