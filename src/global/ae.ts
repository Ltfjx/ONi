import { Ae, Config } from "../interface"
import fs from "fs"
import { loggerGlobal as logger } from "../logger"
import { wsWebBroadcast } from "../websocket"
import { deepEqual } from "../utils"

var ae = {
    // AE 列表
    list: [] as Ae[],

    getListLayout() {
        let content: any = []

        this.list.forEach(ae => {
            content.push({
                type: "card",
                id: "ae-overview",
                config: {
                    uuid: ae.uuid,
                    name: ae.name,
                }
            })
        })

        let _ = [{
            type: "grid-m",
            content: content
        }]

        return _
    },

    getEditLayout() {
        let content: any = []

        this.list.forEach(ae => {
            content.push({
                type: "tab",
                id: "ae-edit",
                config: {
                    uuid: ae.uuid,
                    name: ae.name,
                }
            })
        })

        let _ = [{
            type: "raw",
            content: content
        }]

        return _
    },

    getViewLayout() {
        let content: any = []

        this.list.forEach(ae => {
            content.push({
                type: "tab",
                id: "ae-view",
                config: {
                    uuid: ae.uuid,
                    name: ae.name,
                }
            })
        })

        let _ = [{
            type: "raw",
            content: content
        }]

        return _
    },

    set(ae: Ae) {
        this.list.forEach((item, index) => {
            if (item.uuid == ae.uuid) {
                if (!deepEqual(this.list[index], ae)) {
                    this.list[index] = ae
                    wsWebBroadcast("data/ae", [ae])
                }
                return
            }
        })
    },

    init(config: Config) {
        this.list = JSON.parse(fs.readFileSync('./data/ae/ae.json', 'utf8'))
        logger.trace("aeList", this.list)
    }
}

export default ae