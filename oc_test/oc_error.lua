oc_error = {}

function oc_error.raise(ws, error_message, file, location, taskUuid)
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

return oc_error
