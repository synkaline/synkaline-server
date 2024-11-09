import { HttpServer } from '@/server/HttpServer';
import { Logger } from '@/utils/Logger'

Logger.DEV = true;

(async function () {
    const httpServer = new HttpServer(3000);

   

    await httpServer.init()


    httpServer.start()

    console.log(httpServer.events)
})()
