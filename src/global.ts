import * as fs from 'fs'
import log4js from 'log4js'
import { User, Bot, CommonData, Config } from './interface'

const logger = log4js.getLogger("global")

var global = {
    // 用户列表
    userList: [] as User[],

    // BOT 列表
    botList: [] as Bot[],

    // 通用数据
    commonData: [] as CommonData[],

    // MC 服务器状态
    mcServerStatus: {
        ip: "",
        online: false,
        motd: "",
        players: {
            max: 0,
            online: 0,
            list: []
        }
    },

    // 初始化函数
    init(config: Config) {
        this.userList = JSON.parse(fs.readFileSync('./data/user/user.json', 'utf8'))
        this.botList = JSON.parse(fs.readFileSync('./data/bot/bot.json', 'utf8'))
        this.commonData = JSON.parse(fs.readFileSync('./data/variable/common_data.json', 'utf8'))
        logger.trace("userList", this.userList)
        logger.trace("botList", this.botList)
        logger.trace("commonData", this.commonData)

        this.mcServerStatus.ip = config.mc_server_ip
        logger.trace("mcServerStatus", this.mcServerStatus)
    }
}

export default global