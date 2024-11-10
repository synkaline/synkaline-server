import { HttpServer } from '@/server/HttpServer';
import { Logger } from '@/utils/Logger'
import ytdl from '@distube/ytdl-core';
import { Queue, QueueItem } from '@/structures/Queue';
import WsServer from './server/WsServer';
import { Message } from './structures/Message';

Logger.DEV = true;

declare module 'websocket' {
    interface connection {
        id: string;
    }
}


(async function () {
    const httpServer = new HttpServer(3000);



    await httpServer.init()
    httpServer.start()
    console.log(httpServer.events)

    const wsserver = new WsServer(httpServer.server)


    await wsserver.start()
    await wsserver.init()

    let queue = new Queue()

    let links = [
        "https://www.youtube.com/watch?v=J88v6SomV0k",
        "https://www.youtube.com/watch?v=dYaHTKlxL5s",
        "https://www.youtube.com/watch?v=6yrdS4tIP9U",

    ]


    for (let i = 0; i < links.length; i++) {
        let info = await ytdl.getInfo(links[i])
        let format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' })
        let [previous, previousDuration] = i == 0 ? [Date.now(), 0] : [queue.items[i - 1].startTime, parseInt(queue.items[i - 1].info.videoDetails.lengthSeconds) * 1000]
        queue.addItem({
            info,
            format,
            startTime: previous + previousDuration
        })

    }


    console.log(queue.items.map(x => ({ name: x.info.videoDetails.title, duration: (parseInt(x.info.videoDetails.lengthSeconds) * 1000), start: x.startTime, date: new Date(x.startTime).toLocaleTimeString() })))

    // 5 second delay
    const LOAD_DELAY = 5000;
    wsserver.setQueue(queue)
    wsserver.queue.on('newtrack', (item: QueueItem) => {
        console.log('new track', new Date(item.startTime).toLocaleTimeString(), new Date(Date.now()).toLocaleTimeString())
        for (const client of wsserver.clients.values()) {
            client.send(new Message({
                type: Message.types.NEW_TRACK,
                data: [{ id: item.info.videoDetails.videoId }]
            }).encode())
        }

        // set playback time of current track to current time once newtrack packet has been sent to all users
        let duration = parseInt(wsserver.queue.items[wsserver.queue.current].info.videoDetails.lengthSeconds);
        let durationMs = duration * 1000;
        // add a load delay factor to incorporate poor network connection of users
        wsserver.queue.items[wsserver.queue.current].startTime = Date.now() + LOAD_DELAY;

        console.log('new track', new Date(item.startTime).toLocaleTimeString(), new Date(Date.now()).toLocaleTimeString())

        // start tick after load delay
        // remember this only starts the duration countdown, the track is the same even without the timout starting
        // when user requests before this timeout starts they receive negative seek value, which is fine and handled at client side
        setTimeout(() => {
            setTimeout(wsserver.queue.tick.bind(wsserver.queue), durationMs)
        }, LOAD_DELAY);
    })


    wsserver.queue?.start()
})()
