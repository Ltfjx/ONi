oc_info = {}

oc_info.debugMode = false

function oc_info.error(ws, message, file, location, taskUuid)
    local message = {
        type = "oc/error",
        data = {
            message = message,
            file = file,
            location = location,
            taskUuid = taskUuid
        }
    }

    ws:send(message)
end

function oc_info.warn(ws, message, file, location, taskUuid)
    local message = {
        type = "oc/warn",
        data = {
            message = message,
            file = file,
            location = location,
            taskUuid = taskUuid
        }
    }

    ws:send(message)
end

function oc_info.log(ws, message, file, location, taskUuid)
    local message = {
        type = "oc/info",
        data = {
            message = message,
            file = file,
            location = location,
            taskUuid = taskUuid
        }
    }

    ws:send(message)
end

function oc_info.trace(ws, message, file, location, taskUuid)
    if ~oc_info.debugMode then
        return
    end

    local message = {
        type = "oc/trace",
        data = {
            message = message,
            file = file,
            location = location,
            taskUuid = taskUuid
        }
    }

    ws:send(message)
end

return oc_info
