import log4js from "log4js"
import yaml from "yaml"
import fs from "fs"
import express from "express"
import ejs from "ejs"
import { WebSocket, WebSocketServer } from "ws"
import http from "http"
import crypto from "crypto"

import global from "./global"
import { User, Bot, Config } from "./interface"

const wssWeb = new WebSocketServer({ noServer: true })
const wssOc = new WebSocketServer({ noServer: true })

interface SessionWeb extends WebSocket {
    sessionId: string
    authenticated: boolean
    user?: User
}

interface SessionOc extends WebSocket {
    sessionId: string
    authenticated: boolean
    bot?: Bot
}

function wsSendLog(layout: any) {
    return (loggingEvent: any) => {
        wsWebBroadcast("event/log", layout(loggingEvent))
    }
}

const wsLoggerAppender = {
    configure: (config: any, layouts: any) => {
        return wsSendLog(layouts.basicLayout)
    }
}


log4js.configure({
    appenders: {
        file_main: { type: "file", filename: "logs/main.log", maxLogSize: 1048576, compress: true, keepFileExt: true, backups: 3 },
        console: { type: "console" },
        oni_ws: { type: wsLoggerAppender }
    },
    categories: {
        default: { appenders: ["file_main", "console", "oni_ws"], level: "trace" }
    },
})

const logger = log4js.getLogger("main")
logger.info("Starting Oni...")



var config: Config

try {
    config = yaml.parse(fs.readFileSync('./config.yml', 'utf8'))
} catch (error) {
    if (!fs.existsSync('./config.yml')) {
        logger.warn("Config file not found, creating default config...")
        fs.copyFileSync('./config.yml.default', './config.yml')
        config = yaml.parse(fs.readFileSync('./config.yml', 'utf8'))
    } else {
        logger.error("Failed to load config file, check the file and try again.")
        logger.error(error)
        process.exit(1)
    }
}
logger.level = config.log_level
logger.info("Config file loaded.")
logger.trace("config", config)


global.init(config)


const app = express()
const server = http.createServer(app)





wssWeb.on('connection', (ws: SessionWeb, socket: http.IncomingMessage, request: http.IncomingMessage) => {

    ws.sessionId = crypto.randomUUID()
    ws.authenticated = false

    logger.info(`New WEB WebSocket connection ${ws.sessionId.substring(0, 8)}`)

    ws.on('message', (message: string) => {

        // 解析 JSON
        let json: any
        try {
            json = JSON.parse(message)
        } catch (e) {
            logger.warn("Invalid JSON message received:", message)
            return
        }

        logger.trace("WEB RECEIVED", json)


        if (json.type == "auth/request") {
            // 登录请求
            const user = global.userList.find(user => user.token === json.data.token)
            if (user) {
                ws.authenticated = true
                ws.user = user
                // 返回用户信息
                ws.send(JSON.stringify({ type: "auth/response", data: { user: ws.user } }))

                // 发送历史日志
                const logFile = fs.readFileSync('./logs/main.log', 'utf8')
                const _ = logFile.split('\n').slice(-100).join('\n')
                ws.send(JSON.stringify({ type: "event/log", data: _ }))

                // 发送 overview 布局文件
                ws.send(JSON.stringify({ type: "layout/overview", data: JSON.parse(fs.readFileSync('./data/layout/overview.json', 'utf8')) }))

                // 发送 control 布局文件
                ws.send(JSON.stringify({ type: "layout/control", data: JSON.parse(fs.readFileSync('./data/layout/control.json', 'utf8')) }))

                // 发送 global 数据
                ws.send(JSON.stringify({ type: "global/commonData", data: global.commonData }))

                // 发送 mcServerStatus 数据
                ws.send(JSON.stringify({ type: "global/mcServerStatus", data: global.mcServerStatus }))

                // 发送 events 布局
                ws.send(JSON.stringify({ type: "layout/events", data: global.getEventLayout() }))

                // 发送 bot 布局
                ws.send(JSON.stringify({ type: "layout/botList", data: global.getBotListLayout() }))

            } else {
                logger.warn(`Invalid token ${json.data.token} for user ${ws.sessionId.substring(0, 8)}`)
                ws.send(JSON.stringify({ type: "auth/response", data: { user: undefined } }))

            }
        } else if (json.type == "data/event") {
            // 事件数据
            let target = global.eventList.find(event => event.uuid === json.data.uuid)
            if (target) {
                Object.assign(target, json.data)
                wsWebBroadcast("layout/events", global.getEventLayout())
                logger.trace("event", target)
            }
        } else {
            logger.warn(`Unknown message type ${json.type}`)
        }

    })

})


wssOc.on('connection', (ws: SessionOc, socket: http.IncomingMessage, request: http.IncomingMessage) => {

    ws.sessionId = crypto.randomUUID()
    ws.authenticated = false

    logger.info(`New OC WebSocket connection ${ws.sessionId.substring(0, 8)}`)

    ws.on('message', (message: string) => {


        // 解析 JSON
        let json: any
        try {
            json = JSON.parse(message)
        } catch (e) {
            logger.warn("Invalid JSON message received:", message)
            return
        }

        if (ws.authenticated) {
            logger.trace("OC RECEIVED", json)
        } else {
            logger.warn("OC RECEIVED UNAUTHENTICATED", json)
        }

        if (json.type == "auth/request") {
            // 登录请求
            const bot = global.botList.find(bot => bot.token === json.data.token)
            if (bot) {
                ws.authenticated = true
                ws.bot = bot
                // 返回用户信息
                ws.send(JSON.stringify({ type: "auth/response", data: { bot: ws.bot } }))
            } else {
                logger.warn(`Invalid token ${json.data.token} for bot ${ws.sessionId.substring(0, 8)}`)
                ws.send(JSON.stringify({ type: "auth/response", data: { bot: undefined } }))

            }
        } else if (!ws.authenticated) {
            // 如果未登录
            ws.send(JSON.stringify({ "type": "error", "data": "Not authenticated" }))
        } else {
            // 如果已登录，处理数据
            if (json.type == "data/common") {
                let target = global.commonData.find(data => data.uuid === json.data.uuid)
                if (target) {
                    Object.assign(target, json.data)
                    wsWebBroadcast("data/common", [target])
                    logger.trace("commonData", target)
                } else {
                    ws.send(JSON.stringify({ "type": "error", "data": "Data not found" }))
                }
            } else if (json.type == "data/event") {
                let target = global.eventList.find(event => event.uuid === json.data.uuid)
                if (target) {
                    Object.assign(target, json.data)
                    logger.trace("event", target)
                } else {
                    global.eventList.push(json.data)
                    logger.trace("event", json.data)
                }
                wsWebBroadcast("layout/events", global.getEventLayout())

            } else {
                logger.warn(`Unknown message type ${json.type}`)
            }
        }

    })
})

server.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws/web') {
        wssWeb.handleUpgrade(request, socket, head, (ws) => {
            wssWeb.emit('connection', ws, request)
        })
    } else if (request.url === '/ws/oc') {
        wssOc.handleUpgrade(request, socket, head, (ws) => {
            wssOc.emit('connection', ws, request)
        })
    } else {
        socket.destroy()
    }
})

app.get('/', (req, res) => {
    ejs.renderFile('views/index/index.ejs', {}, (err, str) => {
        if (err) {
            logger.error(err)
            res.sendStatus(500)
        }
        else {
            res.send(str)
        }
    })
})

app.use(express.static('public'))

server.listen(config.port, () => {
    logger.info(`Server started on port ${config.port}.`)
})


// 定时更新 MC 服务器状态
setInterval(mcServerStatusUpdate, 60000)
mcServerStatusUpdate()

async function mcServerStatusUpdate() {
    try {
        const mc = await import('minecraftstatuspinger').then(mc => mc.default)
        const result = await mc.lookup({ host: global.mcServerStatus.ip })
        const data = result.status

        if (data != null) {
            global.mcServerStatus.online = true
            global.mcServerStatus.players.max = data.players.max
            global.mcServerStatus.players.online = data.players.online
            global.mcServerStatus.players.list = data.players.sample
            global.mcServerStatus.motd = data.description
        } else {
            global.mcServerStatus.online = false
        }

        logger.trace("mcServerStatus", global.mcServerStatus)
    } catch (error) {
        global.mcServerStatus.online = false
        logger.error("mcServerStatus", error)
    }
    wsWebBroadcast("data/mcServerStatus", global.mcServerStatus)
}

function wsWebBroadcast(type: string, data: any) {
    wssWeb.clients.forEach(ws => {
        if ((ws as SessionWeb).authenticated) {
            ws.send(JSON.stringify({ type: type, data: data }))
        }
    })
}

function wsOcBroadcast(type: string, data: any) {
    wssOc.clients.forEach(ws => {
        if ((ws as SessionOc).authenticated) {
            ws.send(JSON.stringify({ type: type, data: data }))
        }
    })
}