import log4js from "log4js"
import yaml from "yaml"
import fs from "fs"
import express from "express"
import ejs from "ejs"
import { WebSocket, WebSocketServer } from "ws"
import http from "http"

log4js.configure({
    appenders: {
        file_main: { type: "file", filename: "logs/main.log", maxLogSize: 1048576, compress: true, keepFileExt: true, backups: 3 },
        console: { type: "console" },
    },
    categories: {
        default: { appenders: ["file_main", "console"], level: "trace" }
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
logger.trace(config)


interface User {
    uuid: string
    name: string
    token: string
}

var userList: User[] = JSON.parse(fs.readFileSync('./data/user/user.json', 'utf8'))
logger.trace(userList)

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ noServer: true })

wss.on('connection', (ws: WebSocket, socket: http.IncomingMessage, request: http.IncomingMessage) => {

    interface Session {
        sessionId: string
        authenticated: boolean
        user?: User
    }

    var session: Session = {
        sessionId: crypto.randomUUID(),
        authenticated: false
    }

    logger.info(`New WebSocket connection ${session.sessionId.substring(0, 8)}`)

    ws.on('message', (message: string) => {
        logger.trace(message)
        const raw = JSON.parse(message)
        if (raw.type == "auth_request") {
            const user = userList.find(user => user.token === raw.data.token)
            if (user) {
                session.authenticated = true
                session.user = user
                ws.send(JSON.stringify({ type: "auth_response", uuid: raw.uuid, success: true, data: { success: true, user: session.user } }))
            } else {
                logger.warn(`Invalid token ${raw.data.token} for user ${raw.uuid}`)
                ws.send(JSON.stringify({ type: "auth_response", uuid: raw.uuid, success: false, data: { user: undefined } }))
                ws.close()
            }
        } else if (raw.type == "get_request") {
            const target = raw.data.target
            if (target == "layout/overview") {
                ws.send(JSON.stringify({ type: "get_response", uuid: raw.uuid, success: true, data: JSON.parse(fs.readFileSync('./data/layout/overview.json', 'utf8')) }))
            } else {
                ws.send(JSON.stringify({ type: "get_response", uuid: raw.uuid, success: false, data: {} }))
            }
        } else {
            logger.warn(`Unknown message type ${raw.type}`)
        }
    })

})

server.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws/web') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request)
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