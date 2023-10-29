import Stream from "stream";
import Koa from "koa";

const context = (req, res, app) => {
    const socket = new Stream.Duplex();
    req = Object.assign({ headers: {}, socket }, Stream.Readable.prototype, req || {});
    res = Object.assign({ _headers: {}, socket }, Stream.Writable.prototype, res || {});
    req.socket.remoteAddress = req.socket.remoteAddress || '127.0.0.1';
    app = app || new Koa();
    res.getHeader = k => res._headers[k.toLowerCase()];
    res.setHeader = (k, v) => (res._headers[k.toLowerCase()] = v);
    res.removeHeader = (k, v) => delete res._headers[k.toLowerCase()];
    const retApp = app.createContext(req, res);
    retApp.params = {};
    return retApp;
};

const request = (req, res, app) => context(req, res, app).request;

const response = (req, res, app) => context(req, res, app).response;

export { context };
export { request };
export { response };
export default {
    context,
    request,
    response
};
