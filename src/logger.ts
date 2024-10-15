import log4js, { Config } from "log4js"
import { wsWebBroadcast } from "./websocket"

var Logger = {
    init(config: Config) {
        function wsSendLog(layout: any) {
            return (loggingEvent: any) => {
                wsWebBroadcast("event/log", layout(loggingEvent))
            }
        }

        const wsLoggerAppender = {
            configure: (config: any, layouts: any) => {
                return wsSendLog(layouts.basicLayout)
            }
        }

        log4js.configure({
            appenders: {
                file: { type: "file", filename: "logs/oni.log", maxLogSize: 1048576, compress: true, keepFileExt: true, backups: 3 },
                console: { type: "console" },
                oni_ws: { type: wsLoggerAppender }
            },
            categories: {
                default: { appenders: ["file", "console", "oni_ws"], level: "trace" }
            },
        })
    }
}

export default Logger

export const loggerMain = log4js.getLogger("main")
export const loggerGlobal = log4js.getLogger("global")
export const loggerWebsocket = log4js.getLogger("websocket")
export const loggerServer = log4js.getLogger("server")
export const loggerTask = log4js.getLogger("task")