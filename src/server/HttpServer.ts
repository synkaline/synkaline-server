import express from 'express';
import { readdirSync } from 'fs';
import { createServer } from 'http';
import cors from 'cors';

import HttpEvent from '@/structures/events/HttpEvent';
import Logger from '@/utils/Logger';
import WsServer from '@/server/WsServer';

import type { Express } from 'express';


class HttpServer {
    app: Express;
    WsServer: WsServer;
    // { GET: { 'routepath': Event } }
    events: Map<HttpEvent['method'], Map<string, HttpEvent>>
    PORT: number;
    server: ReturnType<typeof createServer>;

    constructor(PORT: number = 3000) {
        this.PORT = PORT;
        this.events = new Map();
        this.WsServer = null;
        this.server = null

        for (let i = 0; i < HttpEvent.getTypeString().length; i++)
            this.events.set(i, new Map())
        console.log(HttpEvent.getTypeString())
    }

    async init() {
        const eventsPath = readdirSync('./src/events/HTTP');

        if (eventsPath.length === 0)
            return Logger.log("Empty server events");

        for (let i = 0; i < eventsPath.length; i++) {

            if (eventsPath[i].startsWith('.')) continue;

            const event = (await import(`../events/HTTP/${eventsPath[i]}`)).default as HttpEvent;

            const eventType = this.events.get(event.method);
            if (eventType.has(event.route)) continue;

            eventType.set(event.route, event);

           
        }

        Logger.log(`[HTTP_SERVER]`, this.events)
    }

    setWsServer(server: WsServer) {
        this.WsServer = server;
    }

    start() {
        this.app = express();

        this.app.use(cors())

        for (const [method, event] of this.events.entries()) {
            for (const [route, eventHandler] of event.entries()) {

                const _method: 'get' | 'post' | 'put' | 'delete' = HttpEvent.types[method].toLowerCase() as any;

                this.app[_method](route, eventHandler.callback.bind(this));
            }
        }

 
        this.server = createServer(this.app);
        this.server.listen(this.PORT, () => Logger.log(`[HTTP_SERVER] Listening on PORT ${this.PORT}`));
    }
}

export default HttpServer;
export { HttpServer }