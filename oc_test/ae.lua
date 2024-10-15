local ocComponent = require("component")
local oc_error = require("oni/oc_error")
local json = require("dkjson")

local file = "/lib/oni/ae.lua"

ae = {}

local maxHistoryTask = 100

local aeComponents = {}

local craftTasks = {}
local carftTaskQueue = {}

function ae.updateAeComponents()
    aeComponents = {}

    -- 所有的 AE 组件均以 "me_" 开头
    for k, v in pairs(ocComponent.list("me_")) do
        aeComponents[k] = ocComponent.proxy()
    end
end

function ae.getCpus(ws, taskUuid, uuid)
    updateComponent()

    if uuid ~= nil and aeComponents[uuid] == nil then
        oc_error.raise(ws,
            "AE component with uuid = " .. uuid .. " dosen't exist",
            file,
            "getCpus",
            taskUuid
        )
        return
    end

    local comp

    if uuid == nil then
        for k, v in pairs(aeComponents) do
            comp = v
            break
        end
    else
        comp = aeComponents[uuid]
    end

    local message = {
        type = "data/ae",
        data = {}
    }

    local cpus = comp.getCpus()

    for k, v in pairs(cpus) do
        local output = v.cpu.finalOutput()
        local info = {
            cpuName = v.name,
            coproccessors = v.coproccessors,
            storage = v.storage,
            busy = v.busy,
            active = v.cpu.isActive(),
            finalOutput = {
                name = output.name,
                damage = output.damage,
                count = output.size
            }
        }

        message.data[#message.data + 1] = info
    end

    ws:send(json.encode(message))
end

-- 返回与 config 内容对应的处理任务的函数
-- config 中 mode 参数可以为："getCpus", "getItems", "getCraftable", "craft"， "query"
-- craft 函数会返回一个 id 用于追踪合成情况
function ae.newTask(ws, taskUuid, config)

end

return ae
