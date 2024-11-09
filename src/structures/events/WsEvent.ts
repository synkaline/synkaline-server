import Base from "./Event";
import { connection } from 'websocket';
import { Message } from "@/structures/Message";
import WsServer from "@/server/WsServer";


interface Arguments {
    messageType: Message['type'];
    callback: (this: WsServer, ws: connection, message: Message<any>) => Promise<any>;
}

class WsEvent<dataType extends Array<any> = any[]> extends Base {

    eventType: 'ws';
    messageType: Message['type'];
    callback: (this: WsServer, ws: connection, message: Message<dataType>) => Promise<any>;

    constructor({ messageType, callback }: { messageType: Message['type'], callback: (this: WsServer, ws: connection, message: Message<dataType>) => Promise<any> }) {
        super();
        this.messageType = messageType;
        this.callback = callback;
    }

}

export default WsEvent;
export { WsEvent };