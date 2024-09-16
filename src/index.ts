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

        wssWeb.clients.forEach(ws => {
            if ((ws as SessionWeb).authenticated) {
                ws.send(JSON.stringify({
                    type: "event/log",
                    data: layout(loggingEvent)
                }))
            }
        })

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
                ws.send(JSON.stringify({ type: "auth/response", success: true, data: { success: true, user: ws.user } }))

                // 发送历史日志
                const logFile = fs.readFileSync('./logs/main.log', 'utf8')
                const _ = logFile.split('\n').slice(-100).join('\n')
                ws.send(JSON.stringify({ type: "event/log", success: true, data: _ }))

                // 发送 overview 布局文件
                ws.send(JSON.stringify({ type: "layout/overview", success: true, data: JSON.parse(fs.readFileSync('./data/layout/overview.json', 'utf8')) }))

            } else {
                logger.warn(`Invalid token ${json.data.token} for user ${json.uuid}`)
                ws.send(JSON.stringify({ type: "auth/response", success: false, data: { user: undefined } }))
                ws.close()
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

        logger.trace("OC RECEIVED", json)

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
}