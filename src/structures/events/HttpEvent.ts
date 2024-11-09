import BaseEvent from "./Event";
import HttpServer from "@/server/HttpServer";
import type { RequestHandler } from 'express';


enum HttpTypes {
    GET,
    POST,
    PUT,
    DELETE
}


interface Arguments {
    route: string;
    method?: HttpTypes;
    callback: (this: HttpServer, ...args: Parameters<RequestHandler>) => ReturnType<RequestHandler>;
}

class HttpEvent extends BaseEvent {

    static types = HttpTypes;

    route: string;
    method: HttpTypes;
    eventType: 'http';
    callback: Arguments['callback'];
    
    constructor({ route, callback, method }: Arguments) {
        super();
        this.method = method ?? HttpTypes.GET;
        this.route = route;
        this.callback = callback;
    }

    static getTypeString() {
        return Object.keys(HttpEvent.types).filter(key => isNaN(Number(key)));
    }
}

export default HttpEvent;