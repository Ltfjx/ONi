import log4js from "log4js";
import yaml from "yaml";
import fs from "fs";
import express from "express";
log4js.configure({
    appenders: {
        file_main: { type: "file", filename: "logs/main.log", maxLogSize: 1048576, compress: true, keepFileExt: true, backups: 3 },
        console: { type: "console" },
    },
    categories: {
        default: { appenders: ["file_main", "console"], level: "trace" }
    },
});
const logger = log4js.getLogger("main");
logger.info("Starting Oni...");
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
logger.trace(config);
const app = express();
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.listen(config.port, () => {
    logger.info(`Server started on port ${config.port}.`);
});
