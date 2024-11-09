import { HttpServer } from '@/server/HttpServer';
import { Logger } from '@/utils/Logger'
import ytdl from '@distube/ytdl-core';
import { Queue, QueueItem } from '@/structures/Queue';
import WsServer from './server/WsServer';

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
        "https://www.youtube.com/watch?v=dYaHTKlxL5s",
        "https://www.youtube.com/watch?v=J88v6SomV0k",
        "https://www.youtube.com/watch?v=6yrdS4tIP9U",

    ]

    let info = await ytdl.getInfo("https://youtu.be/nxx6-GPfGCc")
    let format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' })
    console.log(format)

    for (let i = 0; i < links.length; i++) {
        let info = await ytdl.getInfo(links[i])
        let format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' })
        let previous = i == 0 ? 0 : parseInt(queue.items[i - 1].info.videoDetails.lengthSeconds) * 1000
        queue.addItem({
            info,
            format,
            startTime: Date.now() + previous
        })

    }


    wsserver.setQueue(queue)
    wsserver.queue.on('newtrack', (item: QueueItem) => {
        console.log(item.info.videoDetails.title)
    })


    wsserver.queue?.start()

    // // Date.now() - item.starttime





    // queue.on('newtrack', (t: QueueItem) => console.log(t.info.videoDetails.title))

    // queue.start();

    // console.log(ytdl.chooseFormat(info.formats, { quality: 'highestaudio' }))
})()
