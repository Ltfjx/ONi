import log4js from "log4js"
import yaml from "yaml"
import fs from "fs"
import express from "express"
import ejs from "ejs"
import { WebSocket, WebSocketServer } from "ws"
import http from "http"
import crypto from "crypto"

const wssWeb = new WebSocketServer({ noServer: true })
const wssOc = new WebSocketServer({ noServer: true })

function wsSendLog(layout: any) {
    return (loggingEvent: any) => {
        wssWeb.clients.forEach(client => {
            client.send(JSON.stringify({
                type: "event_log",
                data: layout(loggingEvent)
            }))
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

interface Config {
    log_level: string
    port: number
}

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


interface User {
    uuid: string
    name: string
    token: string
}

var userList: User[] = JSON.parse(fs.readFileSync('./data/user/user.json', 'utf8'))
logger.trace("userList", userList)


interface Bot {
    uuid: string
    name: string
    token: string
}

var botList: Bot[] = JSON.parse(fs.readFileSync('./data/bot/bot.json', 'utf8'))
logger.trace("botList", botList)


const app = express()
const server = http.createServer(app)


wssWeb.on('connection', (ws: WebSocket, socket: http.IncomingMessage, request: http.IncomingMessage) => {

    interface SessionWeb {
        sessionId: string
        authenticated: boolean
        user?: User
    }

    var session: SessionWeb = {
        sessionId: crypto.randomUUID(),
        authenticated: false
    }

    logger.info(`New WEB WebSocket connection ${session.sessionId.substring(0, 8)}`)

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

        // 判断消息类型
        if (json.type == "auth_request") {
            const user = userList.find(user => user.token === json.data.token)
            if (user) {
                session.authenticated = true
                session.user = user
                ws.send(JSON.stringify({ type: "auth_response", uuid: json.uuid, success: true, data: { success: true, user: session.user } }))
            } else {
                logger.warn(`Invalid token ${json.data.token} for user ${json.uuid}`)
                ws.send(JSON.stringify({ type: "auth_response", uuid: json.uuid, success: false, data: { user: undefined } }))
                ws.close()
            }
        } else if (json.type == "get_request") {
            const target = json.data.target
            if (target == "layout/overview") {
                ws.send(JSON.stringify({ type: "get_response", uuid: json.uuid, success: true, data: JSON.parse(fs.readFileSync('./data/layout/overview.json', 'utf8')) }))
            } if (target == "logs/main") {
                const logFile = fs.readFileSync('./logs/main.log', 'utf8')
                // 取结尾100行
                const _ = logFile.split('\n').slice(-100).join('\n')
                ws.send(JSON.stringify({ type: "get_response", uuid: json.uuid, success: true, data: { lines: _ } }))
            } else {
                ws.send(JSON.stringify({ type: "get_response", uuid: json.uuid, success: false, data: {} }))
            }
        } else {
            logger.warn(`Unknown message type ${json.type}`)
        }

    })

})

wssOc.on('connection', (ws: WebSocket, socket: http.IncomingMessage, request: http.IncomingMessage) => {

    interface SessionOc {
        sessionId: string
        authenticated: boolean
        bot?: Bot
    }

    var session: SessionOc = {
        sessionId: crypto.randomUUID(),
        authenticated: false
    }

    logger.info(`New OC WebSocket connection ${session.sessionId.substring(0, 8)}`)

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