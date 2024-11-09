import { WsEvent } from "@/structures/events";
import { Message } from "@/structures/Message";

export default new WsEvent({
    messageType: Message.types.GET_AUDIO,
    async callback(ws, message) {
        console.log('get audio', message)

        let queue = this.queue;
        let link = queue.items[queue.current].info.videoDetails.videoId

        ws.send(new Message({
            type: Message.types.GET_AUDIO,
            data: [{ id: link }]
        }).encode())
    },
})