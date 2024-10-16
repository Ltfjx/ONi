import fs from "fs";
import { loggerGlobal as logger } from "../logger";
var user = {
    // 用户列表
    userList: [],
    init(config) {
        this.userList = JSON.parse(fs.readFileSync('./data/user/user.json', 'utf8'));
        logger.trace("userList", this.userList);
    }
};
export default user;
