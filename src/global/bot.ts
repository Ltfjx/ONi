import { Bot, Config } from "../interface"
import fs from "fs"
import { loggerGlobal as logger } from "../logger"
import { wsWebBroadcast } from "../websocket"

var bot = {
    // BOT 列表
    list: [] as Bot[],

    getListLayout() {
        let content: any = []

        this.list.forEach(bot => {
            content.push({
                type: "card",
                id: "bot-overview",
                config: {
                    uuid: bot.uuid,
                    name: bot.name,
                }
            })
        })

        let _ = [{
            type: "grid-m",
            content: content
        }]

        _.push({
            type: "raw",
            content: [{
                type: "card",
                id: "create-bot",
                config: {}
            }]
        })

        return _
    },

    getEditLayout() {
        let content: any = []

        this.list.forEach(bot => {
            content.push({
                type: "tab",
                id: "bot-edit",
                config: {
                    uuid: bot.uuid,
                    name: bot.name,
                }
            })
        })

        let _ = [{
            type: "raw",
            content: content
        }]

        return _
    },

    set(bot: Bot) {
        this.list.forEach((item, index) => {
            if (item.uuid == bot.uuid) {
                this.list[index] = bot
                wsWebBroadcast("data/bot", [bot])
                return
            }
        })
    },

    init(config: Config) {
        this.list = JSON.parse(fs.readFileSync('./data/bot/bot.json', 'utf8'))
        logger.trace("botList", this.list)
    }
}

export default bot