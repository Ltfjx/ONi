import fs from "fs";
import { loggerGlobal as logger } from "../logger";
import { wsWebBroadcast } from "../websocket";
var data = {
    // 通用数据
    list: [],
    set(data) {
        this.list.forEach((item, index) => {
            if (item.uuid == data.uuid) {
                this.list[index] = data;
                wsWebBroadcast("data/common", [data]);
                return;
            }
        });
    },
    init(config) {
        this.list = JSON.parse(fs.readFileSync('./data/variable/common_data.json', 'utf8'));
        logger.trace("data", this.list);
    }
};
export default data;
