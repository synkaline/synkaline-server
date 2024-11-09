import fs from 'fs';
import { server } from "websocket";
import { createServer } from 'http'
import colors from 'colors/safe';
import { v4 as uuidv4 } from 'uuid';

import { WsEvent } from "@/structures/events"
import { Message } from "@/structures/Message";
import { Logger } from "@/utils/Logger";

import type { connection } from 'websocket';




class WsServer extends server {


    // this map consists of all the events located under /events folder
    // websocket reads the functions to execute on a specific message from here
    events: Map<Message['type'], WsEvent>;
    clients: Map<string, connection>;

    constructor(httpServer: ReturnType<typeof createServer>) {
        if (!httpServer) throw new Error('No http server found');
        super({ httpServer: httpServer });

        this.events = new Map();

    }

    async init() {
        // loading all events from /events into memory for dynamic execution
        const eventsPath = fs.readdirSync('./src/events/WebSocket');

        if (eventsPath.length === 0) return console.log('empty server events');

        for (let i = 0; i < eventsPath.length; i++) {
            const event = (await import(`../events/WebSocket/${eventsPath[i]}`)).default as WsEvent;

            if (this.events.has(event.messageType)) continue;

            this.events.set(event.messageType, event);
        }

        Logger.log(colors.blue('[WS_SERVER]'), [...this.events.keys()].map(x => Message.types[x]));


    }

    


    start() {
        this.on('connect', (connection) => {

            connection.id = uuidv4()
            Logger.log(colors.blue('[WS_SERVER]'), '[WS_CONNECTION_OPEN]', '-> new user join', connection.id);

            this.clients.set(connection.id, connection)

        });




        this.on('close', (connection, _number, _description) => {

            Logger.log(colors.blue('[WS_SERVER]'), '[WS_CONNECTION_CLOSE]', '-> new user join', connection.id);

            this.clients.delete(connection.id)
        })


        // new websocket request
        this.on('request', request => {


            // this is to accept all requests from all origins
            const connection = request.accept(null, request.origin);


            // connection is the instance of connected client
            connection.on('message', message => {
                // we only want to accept binary data, binary is smaller and faster than strings. 
                if (message.type == 'utf8') return console.error('invalid ws message type');

                // message is my custom class to encode and decode into smaller pakcets for sex speed
                // inflate converts raw binary data to human readable format
                const data = Message.decode(message.binaryData);


                // if no output from inflate, then packet was tampered with 
                // error protection
                if (!data) return console.error('Error parsing message');

                Logger.log(colors.blue('[WS_CLIENT]'), `[${Message.types[data.type]}] ->`, data);


                // see if the event sent from client is registered on server side
                const wsevent = this.events.get(data.type);

                // if not, exit
                if (!wsevent) return;

                // if exists, then execute the associated function written in server to handle request
                wsevent.callback.call(this, connection, data);

            });

        })
    }
}

export default WsServer;