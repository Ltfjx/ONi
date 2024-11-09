oc_info = {}

oc_info.debug = false

function oc_info.error(ws, error_message, file, location, taskUuid)
    local message = {
        type = "oc/error",
        data = {
            message = error_message,
            file = file,
            location = location,
            taskUuid = taskUuid
        }
    }

    ws:send(message)
end

function oc_info.log(ws, error_message, file, location, taskUuid)
    local message = {
        type = "oc/info",
        data = {
            message = error_message,
            file = file,
            location = location,
            taskUuid = taskUuid
        }
    }

    ws:send(message)
end

function oc_info.trace(ws, error_message, file, location, taskUuid)
    if ~debug then
        return
    end

    local message = {
        type = "oc/trace",
        data = {
            message = error_message,
            file = file,
            location = location,
            taskUuid = taskUuid
        }
    }

    ws:send(message)
end

return oc_info
