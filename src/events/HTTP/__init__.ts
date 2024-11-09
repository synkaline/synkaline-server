import HttpEvent from "@/structures/events/HttpEvent";

export default new HttpEvent({
    route: '/',
    method: HttpEvent.types.GET,
    callback(_req, res, _next) {
        res.end('hello')
    },
})