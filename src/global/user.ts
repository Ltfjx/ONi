import { Config, User } from "../interface.js"
import fs from "fs"
import { loggerGlobal as logger } from "../logger.js"

var user = {
    // 用户列表
    list: [] as User[],

    init(config: Config) {
        this.list = JSON.parse(fs.readFileSync('./data/user/user.json', 'utf8'))
        logger.trace("userList", this.list)
    }
}


export default user