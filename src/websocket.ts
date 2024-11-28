import { WebSocket, WebSocketServer } from "ws"
import http from "http"
import fs from "fs"
import { User, Bot, Data } from "./interface.js"
import { loggerWebsocket as logger } from "./logger.js"
import Global from "./global/index.js"
import { Config } from "log4js"

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

export const wssWeb = new WebSocketServer({ noServer: true })
export const wssOc = new WebSocketServer({ noServer: true })

var Websocket = {
    init(config: Config) {
        wssWeb.on('connection', (ws: SessionWeb, socket: http.IncomingMessage, request: http.IncomingMessage) => {

            ws.sessionId = crypto.randomUUID()
            ws.authenticated = false

            logger.info(`New WEB WebSocket connection ${ws.sessionId.substring(0, 8)}`)

            ws.on('close', (code: number, reason: string) => {
                logger.info(`WEB WebSocket connection ${ws.sessionId.substring(0, 8)} closed with code ${code} and reason ${reason}`)
            })

            ws.on('error', (error: Error) => {
                logger.error(`WEB WebSocket connection ${ws.sessionId.substring(0, 8)} error`, error)
            })

            ws.on('message', (message: string) => {

                // 解析 JSON
                let json: any
                try {
                    json = JSON.parse(message)
                } catch (e) {
                    logger.error("Invalid JSON message received:", message)
                    logger.error(e)
                    return
                }

                logger.trace("WEB RECEIVED", json)


                if (json.type == "auth/request") {
                    // 登录请求
                    const user = Global.user.list.find(user => user.token === json.data.token)
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
                        ws.send(JSON.stringify({ type: "layout/control", data: Global.redstone.getLayout() }))

                        // 发送 data 数据
                        ws.send(JSON.stringify({ type: "global/data", data: Global.data.list }))

                        // 发送 mcServerStatus 数据
                        ws.send(JSON.stringify({ type: "global/mcServerStatus", data: Global.mcServerStatus.status }))

                        // 发送 events 布局
                        ws.send(JSON.stringify({ type: "layout/events", data: Global.event.getLayout() }))

                        // 发送 bot 数据
                        ws.send(JSON.stringify({ type: "global/bot", data: Global.bot.list }))

                        // 发送 bot list 布局
                        ws.send(JSON.stringify({ type: "layout/botList", data: Global.bot.getListLayout() }))

                        // 发送 bot task 列表
                        ws.send(JSON.stringify({ type: "global/botTask", data: Global.staticResources.botTask }))

                        // 发送 bot 编辑布局
                        ws.send(JSON.stringify({ type: "layout/botEdit", data: Global.bot.getEditLayout() }))

                        // 发送 ae 数据
                        ws.send(JSON.stringify({ type: "global/ae", data: Global.ae.list }))

                        // 发送 ae list 布局
                        ws.send(JSON.stringify({ type: "layout/aeList", data: Global.ae.getListLayout() }))

                        // 发送 ae 查看布局
                        ws.send(JSON.stringify({ type: "layout/aeView", data: Global.ae.getViewLayout() }))

                        // 发送 ae 编辑布局
                        ws.send(JSON.stringify({ type: "layout/aeEdit", data: Global.ae.getEditLayout() }))


                    } else {
                        logger.warn(`Invalid token ${json.data.token} for user ${ws.sessionId.substring(0, 8)}`)
                        ws.send(JSON.stringify({ type: "auth/response", data: { user: undefined } }))
                    }
                } else if (json.type == "data/event") {
                    // 事件数据
                    let target = Global.event.list.find(event => event.uuid === json.data.uuid)
                    if (target) {
                        let target = Global.event.list.find(event => event.uuid === json.data.uuid)
                        if (target) {
                            const event = Object.assign({}, target, json.data)
                            Global.event.set(event)
                        } else {
                            logger.warn(`Trying to update event ${json.data.uuid} but not found`)
                        }
                    }
                } else if (json.type == "oc/task") {
                    // 转发 task 到 oc
                    let ok = false
                    wssOc.clients.forEach(ws => {
                        if ((ws as SessionOc).authenticated && (ws as SessionOc).bot?.uuid == json.target) {
                            ws.send(JSON.stringify({
                                type: "task",
                                data: json.data
                            }))
                            ok = true
                        }
                    })
                    if (!ok) {
                        logger.warn(`Trying to send task to oc but bot ${json.target} not found or offline`)
                    }
                } else if (json.type == "oc/forward") {
                    // debug 转发
                    let ok = false
                    wssOc.clients.forEach(ws => {
                        if ((ws as SessionOc).authenticated && (ws as SessionOc).bot?.uuid == json.target) {
                            ws.send(JSON.stringify(json.data))
                            ok = true
                        }
                    })
                    if (!ok) {
                        logger.warn(`Trying to forward debug message to oc but bot ${json.target} not found or offline`)
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

            ws.on('close', (code: number, reason: string) => {
                logger.info(`OC WebSocket connection ${ws.sessionId.substring(0, 8)} closed with code ${code} and reason ${reason}`)
            })

            ws.on('error', (error: Error) => {
                logger.error(`OC WebSocket connection ${ws.sessionId.substring(0, 8)} error`, error)
            })

            ws.on('message', (message: string) => {


                // 解析 JSON
                let json: any
                try {
                    json = JSON.parse(message)
                } catch (e) {
                    logger.error("Invalid JSON message received:", message)
                    logger.error(e)
                    return
                }

                logger.trace("OC RECEIVED", json)

                if (json.type == "auth/request") {
                    // 登录请求
                    const bot = Global.bot.list.find(bot => bot.token === json.data.token)
                    if (bot) {
                        ws.authenticated = true
                        ws.bot = bot
                        // 返回用户信息
                        ws.send(JSON.stringify({ type: "auth/response", data: { bot: bot } }))
                        // 发送 tasks 数据
                        ws.send(JSON.stringify({ type: "task", data: bot.tasks }))
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
                        let target = Global.data.list.find(data => data.uuid === json.data.uuid)
                        if (target) {
                            const data: Data = Object.assign({}, target, json.data)
                            Global.data.set(data)
                        } else {
                            ws.send(JSON.stringify({ "type": "error", "data": "Data not found" }))
                        }
                    } else if (json.type == "data/event") {
                        let target = Global.event.list.find(event => event.uuid === json.data.uuid)
                        if (target) {
                            const event = Object.assign({}, target, json.data)
                            Global.event.set(event)
                        } else {
                            Global.event.add(json.data)
                        }
                    } else if (json.type == "component") {
                        let target = Global.bot.list.find(bot => bot.uuid === ws.bot?.uuid)
                        if (target) {
                            const bot = Object.assign({}, target, json.data)
                            Global.bot.set(bot)
                        }
                    } else if (json.type == "data/ae/itemList") {
                        let target = Global.ae.list.find(ae => ae.uuid === json.data.uuid)
                        if (target) {
                            json.data.itemList.forEach((item: any) => {
                                if (item.type == "item") {
                                    const itemPanelItem = Global.staticResources.itemPanelItem.find(itemPanelItem => (itemPanelItem.name == item.name) && (itemPanelItem.damage == item.damage))
                                    if (itemPanelItem) {
                                        item.id = itemPanelItem.id
                                        item.display = itemPanelItem.display
                                    } else {
                                        logger.warn(`Item ${item.name} not found in staticResources.itemPanel`)
                                    }
                                } else if (item.type == "fluid") {
                                    const itemPanelFluid = Global.staticResources.itemPanelFluid.find(itemPanelFluid => itemPanelFluid.name == item.name)
                                    if (itemPanelFluid) {
                                        item.id = itemPanelFluid.id
                                        item.display = itemPanelFluid.display
                                    } else {
                                        logger.warn(`Fluid ${item.name} not found in staticResources.itemPanel`)
                                    }
                                } else if (item.type == "vis") {
                                    // TODO: 处理 vis 类型
                                } else {
                                    logger.warn(`Unknown item type ${item.type}`)
                                }
                            })
                            const ae = Object.assign({}, target, json.data)
                            Global.ae.set(ae)
                        }
                    } else if (json.type == "data/ae/cpus") {
                        let target = Global.ae.list.find(ae => ae.uuid === json.data.uuid)
                        if (target) {
                            json.data.cpus.forEach((cpu: any) => {
                                if (cpu.busy && cpu.finalOutput) {
                                    console.log(cpu.finalOutput)
                                    const itemPanelItem = Global.staticResources.itemPanelItem.find(itemPanelItem => (itemPanelItem.name == cpu.finalOutput.name) && (itemPanelItem.damage == cpu.finalOutput.damage))
                                    const itemPanelFluid = Global.staticResources.itemPanelFluid.find(itemPanelFluid => itemPanelFluid.name == cpu.finalOutput.name)
                                    if (itemPanelItem) {
                                        cpu.finalOutput.id = itemPanelItem.id
                                        cpu.finalOutput.display = itemPanelItem.display
                                    } else if (itemPanelFluid) {
                                        cpu.finalOutput.id = itemPanelFluid.id
                                        cpu.finalOutput.display = itemPanelFluid.display
                                    } else {
                                        logger.warn(`Item/Fluid ${cpu.finalOutput.name} not found in staticResources.itemPanel`)
                                    }
                                }
                            })
                            const ae = Object.assign({}, target, json.data)
                            Global.ae.set(ae)
                        }
                    } else {
                        logger.warn(`Unknown message type ${json.type}`)
                    }
                }

            })
        })

    }
}

export default Websocket

export function wsWebBroadcast(type: string, data: any) {
    wssWeb.clients.forEach(ws => {
        if ((ws as SessionWeb).authenticated) {
            ws.send(JSON.stringify({ type: type, data: data }))
        }
    })
}

export function wsOcBroadcast(type: string, data: any) {
    // logger.trace("wsOcBroadcast")
    wssOc.clients.forEach(ws => {
        if ((ws as SessionOc).authenticated) {
            ws.send(JSON.stringify({ type: type, data: data }))
        }
    })
}