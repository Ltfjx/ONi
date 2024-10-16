import fs from "fs";
import { loggerGlobal as logger } from "../logger";
var user = {
    // 用户列表
    list: [],
    init(config) {
        this.list = JSON.parse(fs.readFileSync('./data/user/user.json', 'utf8'));
        logger.trace("userList", this.list);
    }
};
export default user;
