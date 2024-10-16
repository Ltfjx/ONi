import fs from "fs";
import { loggerGlobal as logger } from "../logger";
import { wsWebBroadcast } from "../websocket";
var data = {
    // 通用数据
    dataList: [],
    set(data) {
        this.dataList.forEach((item, index) => {
            if (item.uuid == data.uuid) {
                this.dataList[index] = data;
                wsWebBroadcast("data/common", [data]);
                return;
            }
        });
    },
    init(config) {
        this.dataList = JSON.parse(fs.readFileSync('./data/variable/common_data.json', 'utf8'));
        logger.trace("data", this.dataList);
    }
};
export default data;
