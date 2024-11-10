import Logger from "@/utils/Logger";
import type { videoInfo, videoFormat } from "@distube/ytdl-core"
import EventEmitter from "events";

type QueueItem = {
    info: videoInfo,
    format: videoFormat
    startTime: ReturnType<typeof Date['now']> | null
}
class Queue extends EventEmitter{

    current: number;
    items: QueueItem[];


    constructor() {
        super();
        this.current = -1;
        this.items = [];

    }

    start() {
        this.tick();
    }

    tick() {
        this.current++;

        if (this.current > this.items.length - 1) {
            Logger.log('[QUEUE]', 'queue exhausted, restart queue')
            this.current = 0
            return
        }

        this.emit('newtrack', (this.items[this.current]))

        // let duration = parseInt(this.items[this.current].info.videoDetails.lengthSeconds) * 1000
        // setTimeout(this.tick.bind(this), duration);
    }

    addItem(item: QueueItem) {
        this.items.push(item)
    }

}

export default Queue;
export type { QueueItem };
export { Queue };