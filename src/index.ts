import { HttpServer } from '@/server/HttpServer';
import { Logger } from '@/utils/Logger'
import ytdl from '@distube/ytdl-core';
import { Queue, QueueItem } from '@/structures/Queue';

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

    let queue = new Queue()

    let links = [
        "https://www.youtube.com/watch?v=J88v6SomV0k",
        "https://www.youtube.com/watch?v=6yrdS4tIP9U",

    ]

    for (let i = 0; i < links.length; i++) {
        let info = await ytdl.getInfo(links[i])
        let format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' })
        queue.addItem({
            info,
            format,
            startTime: Date.now()
        })
    }

    

    
    queue.on('newtrack', (t: QueueItem) => console.log(t.info.videoDetails.title))

    queue.start();

    // console.log(ytdl.chooseFormat(info.formats, { quality: 'highestaudio' }))
})()
