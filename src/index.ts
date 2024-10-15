import yaml from "yaml"
import fs from "fs"
import Global from "./global"
import Server from "./server"
import Logger from "./logger"
import { Config } from "./interface"
import { loggerMain as logger } from "./logger"
import Websocket, { wsWebBroadcast } from "./websocket"
import TaskMcServerStatus from "./task/mcServerStatus"

logger.info("Starting Oni...")

var config: Config

try {
    config = yaml.parse(fs.readFileSync('./config.yml', 'utf8'))
} catch (error) {
    if (!fs.existsSync('./config.yml')) {
        logger.warn("Config file not found, creating default config...")
        fs.copyFileSync('./config.yml.default', './config.yml')
        config = yaml.parse(fs.readFileSync('./config.yml', 'utf8'))
    } else {
        logger.error("Failed to load config file, check the file and try again.")
        logger.error(error)
        process.exit(1)
    }
}

logger.level = config.log_level
logger.info("Config file loaded.")
logger.trace("config", config)

// 初始化模块
Logger.init(config)
Global.init(config)
Server.init(config)
Websocket.init(config)

// 启动定时任务
TaskMcServerStatus.init(config)

// setInterval(() => wsOcBroadcast("task", [{ "task": "component", "interval": -1, "config": {} }]), 5000)