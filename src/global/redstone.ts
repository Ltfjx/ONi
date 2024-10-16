import { Config, Redstone } from "../interface"
import fs from "fs"
import { loggerGlobal as logger } from "../logger"

var redstone = {
    // 红石控制组件
    list: [] as Redstone[],

    getLayout() {
        let content: any = []

        this.list.forEach(redstone => {
            if (redstone.type == "digital") {
                content.push({
                    type: "card",
                    id: "control-redstone-digital",
                    config: {
                        uuid: redstone.uuid,
                        botUuid: redstone.botUuid,
                        name: redstone.name,
                        description: redstone.description,
                        value: redstone.value,
                        side: redstone.side
                    }
                })
            } else if (redstone.type == "analog") {
                content.push({
                    type: "card",
                    id: "control-redstone-analog",
                    config: {
                        uuid: redstone.uuid,
                        botUuid: redstone.botUuid,
                        name: redstone.name,
                        description: redstone.description,
                        value: redstone.value,
                        side: redstone.side
                    }
                })
            }
        })

        let _ = [{
            type: "grid-m",
            content: content
        }]

        return _
    },

    init(config: Config) {
        this.list = JSON.parse(fs.readFileSync('./data/variable/redstone_control.json', 'utf8'))
        logger.trace("redstone", this.list)
    }
}

export default redstone