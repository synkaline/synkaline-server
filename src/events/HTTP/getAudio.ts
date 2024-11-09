import HttpEvent from "@/structures/events/HttpEvent";
import ytdl from "@distube/ytdl-core";
import { url } from "inspector";

export default new HttpEvent({
    route: '/getAudio',
    method: HttpEvent.types.GET,
    // @ts-ignore
    async callback(req, res, _next) {
        const videoUrl = 'https://www.youtube.com/watch?v=iVKEcznDqDg'

        // Validate the YouTube URL
        if (!videoUrl || !ytdl.validateURL(videoUrl)) {
            return res.status(400).json({ error: 'Invalid or missing YouTube URL' });
        }

        try {

            // Get the audio file size
            const info = await ytdl.getInfo(videoUrl);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
            const contentLength = format.contentLength ? parseInt(format.contentLength, 10) : undefined;

            if (contentLength === undefined) {
                return res.status(500).json({ error: 'Failed to retrieve audio size' });
            }

            // Get the range header if it exists
            const range = req.headers.range;
            if (range) {
                const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
                const start = parseInt(startStr, 10);
                const end = endStr ? parseInt(endStr, 10) : contentLength - 1;

                res.status(206).set({
                    "Content-Range": `bytes ${start}-${end}/${contentLength}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": end - start + 1,
                    "Content-Type": "audio/mpeg"
                });

                ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio', range: { start, end } }).pipe(res);
            } else {
                res.set({
                    "Content-Length": contentLength,
                    "Content-Type": "audio/mpeg"
                });

                ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio' }).pipe(res);
            }
        } catch (error) {
            console.error('Error streaming audio:', error);
            res.status(500).json({ error: 'Failed to stream audio' });
        }
    },
})