import { WebSocketServer } from "ws";
import fs from "fs";
import { loggerWebsocket as logger } from "./logger";
import Global from "./global";
export const wssWeb = new WebSocketServer({ noServer: true });
export const wssOc = new WebSocketServer({ noServer: true });
var Websocket = {
    init(config) {
        wssWeb.on('connection', (ws, socket, request) => {
            ws.sessionId = crypto.randomUUID();
            ws.authenticated = false;
            logger.info(`New WEB WebSocket connection ${ws.sessionId.substring(0, 8)}`);
            ws.on('message', (message) => {
                // 解析 JSON
                let json;
                try {
                    json = JSON.parse(message);
                }
                catch (e) {
                    logger.warn("Invalid JSON message received:", message);
                    return;
                }
                logger.trace("WEB RECEIVED", json);
                if (json.type == "auth/request") {
                    // 登录请求
                    const user = Global.userList.find(user => user.token === json.data.token);
                    if (user) {
                        ws.authenticated = true;
                        ws.user = user;
                        // 返回用户信息
                        ws.send(JSON.stringify({ type: "auth/response", data: { user: ws.user } }));
                        // 发送历史日志
                        const logFile = fs.readFileSync('./logs/main.log', 'utf8');
                        const _ = logFile.split('\n').slice(-100).join('\n');
                        ws.send(JSON.stringify({ type: "event/log", data: _ }));
                        // 发送 overview 布局文件
                        ws.send(JSON.stringify({ type: "layout/overview", data: JSON.parse(fs.readFileSync('./data/layout/overview.json', 'utf8')) }));
                        // 发送 control 布局文件
                        ws.send(JSON.stringify({ type: "layout/control", data: JSON.parse(fs.readFileSync('./data/layout/control.json', 'utf8')) }));
                        // 发送 global 数据
                        ws.send(JSON.stringify({ type: "global/commonData", data: Global.commonData }));
                        // 发送 mcServerStatus 数据
                        ws.send(JSON.stringify({ type: "global/mcServerStatus", data: Global.mcServerStatus }));
                        // 发送 events 布局
                        ws.send(JSON.stringify({ type: "layout/events", data: Global.getEventLayout() }));
                        // 发送 bot list 布局
                        ws.send(JSON.stringify({ type: "layout/botList", data: Global.getBotListLayout() }));
                        // 发送 bot 编辑布局
                        ws.send(JSON.stringify({ type: "layout/botEdit", data: Global.getBotEditLayout() }));
                        // 发送 ae list 布局
                        ws.send(JSON.stringify({ type: "layout/aeList", data: Global.getAeListLayout() }));
                        // 发送 ae 查看布局
                        ws.send(JSON.stringify({ type: "layout/aeView", data: Global.getAeViewLayout() }));
                        // 发送 ae 编辑布局
                        ws.send(JSON.stringify({ type: "layout/aeEdit", data: Global.getAeEditLayout() }));
                    }
                    else {
                        logger.warn(`Invalid token ${json.data.token} for user ${ws.sessionId.substring(0, 8)}`);
                        ws.send(JSON.stringify({ type: "auth/response", data: { user: undefined } }));
                    }
                }
                else if (json.type == "data/event") {
                    // 事件数据
                    let target = Global.eventList.find(event => event.uuid === json.data.uuid);
                    if (target) {
                        let target = Global.eventList.find(event => event.uuid === json.data.uuid);
                        if (target) {
                            const event = Object.assign({}, target, json.data);
                            Global.setEvent(event);
                        }
                        else {
                            logger.warn(`Trying to update event ${json.data.uuid} but not found`);
                        }
                    }
                }
                else {
                    logger.warn(`Unknown message type ${json.type}`);
                }
            });
        });
        wssOc.on('connection', (ws, socket, request) => {
            ws.sessionId = crypto.randomUUID();
            ws.authenticated = false;
            logger.info(`New OC WebSocket connection ${ws.sessionId.substring(0, 8)}`);
            ws.on('message', (message) => {
                // 解析 JSON
                let json;
                try {
                    json = JSON.parse(message);
                }
                catch (e) {
                    logger.warn("Invalid JSON message received:", message);
                    return;
                }
                if (ws.authenticated) {
                    logger.trace("OC RECEIVED", json);
                }
                else {
                    logger.warn("OC RECEIVED UNAUTHENTICATED", json);
                }
                if (json.type == "auth/request") {
                    // 登录请求
                    const bot = Global.botList.find(bot => bot.token === json.data.token);
                    if (bot) {
                        ws.authenticated = true;
                        ws.bot = bot;
                        // 返回用户信息
                        ws.send(JSON.stringify({ type: "auth/response", data: { bot: ws.bot } }));
                    }
                    else {
                        logger.warn(`Invalid token ${json.data.token} for bot ${ws.sessionId.substring(0, 8)}`);
                        ws.send(JSON.stringify({ type: "auth/response", data: { bot: undefined } }));
                    }
                }
                else if (!ws.authenticated) {
                    // 如果未登录
                    ws.send(JSON.stringify({ "type": "error", "data": "Not authenticated" }));
                }
                else {
                    // 如果已登录，处理数据
                    if (json.type == "data/common") {
                        let target = Global.commonData.find(data => data.uuid === json.data.uuid);
                        if (target) {
                            const data = Object.assign({}, target, json.data);
                            Global.setCommonData(data);
                        }
                        else {
                            ws.send(JSON.stringify({ "type": "error", "data": "Data not found" }));
                        }
                    }
                    else if (json.type == "data/event") {
                        let target = Global.eventList.find(event => event.uuid === json.data.uuid);
                        if (target) {
                            const event = Object.assign({}, target, json.data);
                            Global.setEvent(event);
                        }
                        else {
                            Global.addEvent(json.data);
                        }
                    }
                    else {
                        logger.warn(`Unknown message type ${json.type}`);
                    }
                }
            });
        });
    }
};
export default Websocket;
export function wsWebBroadcast(type, data) {
    wssWeb.clients.forEach(ws => {
        if (ws.authenticated) {
            ws.send(JSON.stringify({ type: type, data: data }));
        }
    });
}
export function wsOcBroadcast(type, data) {
    // logger.trace("wsOcBroadcast")
    wssOc.clients.forEach(ws => {
        if (ws.authenticated) {
            ws.send(JSON.stringify({ type: type, data: data }));
        }
    });
}
