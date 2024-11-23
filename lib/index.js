import yaml from "yaml";
import fs from "fs";
import Global from "./global/index.js";
import Server from "./server.js";
import Logger from "./logger.js";
import { loggerMain as logger } from "./logger.js";
import Websocket from "./websocket.js";
import TaskMcServerStatus from "./task/mcServerStatus.js";
logger.level = "TRACE";
logger.info("Starting ONi...");
var config;
try {
    config = yaml.parse(fs.readFileSync('./config.yml', 'utf8'));
}
catch (error) {
    if (!fs.existsSync('./config.yml')) {
        logger.warn("Config file not found, creating default config...");
        fs.copyFileSync('./config.yml.default', './config.yml');
        config = yaml.parse(fs.readFileSync('./config.yml', 'utf8'));
    }
    else {
        logger.error("Failed to load config file, check the file and try again.");
        logger.error(error);
        process.exit(1);
    }
}
logger.level = config.log_level;
logger.info("Config file loaded.");
logger.trace("config", config);
// 初始化模块
const initializeModule = (module, moduleName) => {
    try {
        module.init(config);
        logger.info(`${moduleName} module initialized.`);
    }
    catch (error) {
        logger.error(`Failed to initialize ${moduleName.toLowerCase()} module, please check the log.`);
        logger.error(error);
        process.exit(1);
    }
};
initializeModule(Logger, 'Logger');
initializeModule(Global, 'Global');
initializeModule(Server, 'Server');
initializeModule(Websocket, 'Websocket');
// 启动定时任务
TaskMcServerStatus.init(config);
// setInterval(() => wsOcBroadcast("task", [{ "task": "component", "interval": -1, "config": {} }]), 5000)
