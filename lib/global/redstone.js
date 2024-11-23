import fs from "fs";
import { loggerGlobal as logger } from "../logger.js";
var redstone = {
    // 红石控制组件
    list: [],
    getLayout() {
        let content = [];
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
                });
            }
            else if (redstone.type == "analog") {
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
                });
            }
        });
        let _ = [{
                type: "grid-m",
                content: content
            }];
        return _;
    },
    init(config) {
        try {
            this.list = JSON.parse(fs.readFileSync('./data/variable/redstone_control.json', 'utf8'));
            logger.debug("redstone", "Json initialized successfully.");
            logger.trace("redstone", this.list);
        }
        catch (e) {
            logger.error("redstone", "Json initialization failed.");
            logger.error("redstone", e);
        }
    }
};
export default redstone;
