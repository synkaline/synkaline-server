import { WsEvent } from "@/structures/events";
import { Message } from "@/structures/Message";

export default new WsEvent({
    messageType: Message.types.GET_SEEK,
    async callback(ws, _message) {
        console.log('get seek')
        let curr = Date.now()

        let seek = curr - this.queue.items[this.queue.current].startTime

        ws.send(new Message({
            type: Message.types.GET_SEEK,
            data: [{ seek: seek }]
        }).encode())
    },
})