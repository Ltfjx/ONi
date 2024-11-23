local ocComponent = require("component")
local json = require("dkjson")
local oc_info = require("oni/oc_info")

local file = "oni/gt_machine.lua"

gt_machine = {}

local machineList = {}

-- 获取字符串 str 中的第 ord 个数字
local function extractNumber(ws, taskUuid, str, ord)
    if ord == nil then
        ord = 1
    end

    local i = 1

    for word in string.gmatch(str, "[%d,.]+") do
        if i == ord then
            word = string.gsub(word, ",", "")
            return word
        end
        i = i + 1
    end

    oc_info.warn(
        ws,
        "number extract failed: number of nums in string less than " .. ord,
        file,
        "extractNumber",
        taskUuid
    )

    return "0"
end

function gt_machine.updateMachine()
    machineList = {}
    for k, v in pairs(ocComponent.list("gt_machine")) do
        local comp = ocComponent.proxy(k)
        machineList[comp.address] = {
            component = comp,
            name = comp.getName()
        }
    end
end

-- 上传连接到该 OC 设备的所有 gt_machine 信息
-- 格式为：
-- {
--     "type": "data/gt_machine",
--     "data": {
--         "taskUuid": "xxx",
--         "machine": {
--             {
--                 "address": <uuid>,
--                 "name": <string>
--             },
--             ...
--         }
--     }
-- }
function gt_machine.getMachine(ws, taskUuid)
    gt_machine.updateMachine()

    local message = {
        type = "data/gt_machine",
        data = {
            taskUuid = taskUuid,
            machine = {}
        }
    }

    for k, v in pairs(machineList) do
        message.data.machine[#message.data.machine + 1] = {
            uuid = k,
            name = v.name
        }
    end

    ws:send(json.encode(message))
end

-- 上传指定 uuid 的 gt_machine 的电量信息
-- 格式为：
-- {
--     "type": "data/eu",
--     "data": {
--         "taskUuid" = <uuid>,
--         "uuid" = <uuid>,
--         "EUCapacity" = <string>,
--         "EUStorage" = <string>
--     }
-- }
function gt_machine.getEUInfo(ws, taskUuid, uuid)
    gt_machine.updateMachine()

    if machineList[uuid] == nil then
        oc_info.warn(
            ws,
            "gt machine with uuid: " .. uuid " not found",
            file,
            "getEUInfo",
            taskUuid
        )
        return
    end

    local comp = machineList[uuid].component

    local message = {
        type = "data/eu",
        data = {
            taskUuid = taskUuid,
            uuid = uuid,
            EUCapacity = comp.getEUCapacityString(),
            EUStorage = comp.getStoredEUString()
        }
    }

    if string.find(machineList[uuid].name, "supercapacitor") ~= nil then
        message.data.EUStorage = extractNumber(ws, taskUuid, comp.getSensorInformation()[2])
    end

    ws:send(json.encode(message))
end

-- 上传指定 uuid 的 gt_machine 的流体信息
-- 格式为：
-- {
--     "type": "data/fluid",
--     "data": {
--         "taskUuid": "xxx",
--         "fluid": {
--             {
--                 "name": <string>（本地化名称）,
--                 "capacity": <string>,
--                 "storage": <string>,
--             },
--             ...
--         }
--     }
-- }
function gt_machine.getFluidInfo(ws, taskUuid, uuid)
    gt_machine.updateMachine()
    -- supportedMachine: {
    --     "yottafluidtank",
    --     "multimachine.tfft",
    --     "super.tank",
    --     "quantum.tank"
    -- }

    local comp = machineList[uuid].component
    local name = machineList[uuid].name

    if comp == nil then
        oc_info.warn(
            ws,
            "gt machine with uuid: " .. uuid .. " not found",
            file,
            "getEUInfo",
            taskUuid
        )
        return
    end

    local message = {
        type = "data/fluid",
        data = {
            taskUuid = taskUuid,
            fluid = {}
        }
    }

    local sensor = comp.getSensorInformation()

    if string.find(name, "yottafluidtank") ~= nil then
        message.data.fluid[1] = {
            name = string.sub(sensor[2], 4, #sensor[2] - 3),
            capacity = extractNumber(ws, taskUuid, sensor[4]),
            storage = extractNumber(ws, taskUuid, sensor[6])
        }
        print(sensor[2], #sensor[2])
    elseif string.find(name, "tfft") then
        local capacity = extractNumber(ws, taskUuid, sensor[30])
        for i = 2, 26 do
            message.data.fluid[i - 1] = {
                name = string.match(sensor[i], "-%s(.+):"),
                storage = string.gsub(string.match(sensor[i], ":%s([0-9,.]+)L"), ",", ""),
                capacity = capacity
            }
        end
    elseif string.find(name, "super.tank") ~= nil or string.find(name, "quantum.tank") ~= nil then
        message.data.fluid[1] = {
            name = string.sub(sensor[3], 4, #sensor[3] - 3),
            capacity = extractNumber(ws, taskUuid, sensor[4], 2),
            storage = extractNumber(ws, taskUuid, sensor[4], 1)
        }
    else
        oc_info.warn(
            ws,
            "unsupported machine: " .. name,
            file,
            "getFluidInfo",
            taskUuid
        )
    end

    ws:send(json.encode(message))
end

function gt_machine.newTask(ws, taskUuid, config)
    if config.mode == "getMachine" then
        return (function()
            gt_machine.getMachine(ws, taskUuid)
        end)
    elseif config.mode == "getEUInfo" then
        return (function()
            gt_machine.getEUInfo(ws, taskUuid, config.uuid)
        end)
    elseif config.mode == "getFluidInfo" then
        return (function()
            gt_machine.getFluidInfo(ws, taskUuid, config.uuid)
        end)
    else
        oc_info.warn(
            ws,
            "unknown task mode: " .. config.mode,
            file,
            "newTask",
            taskUuid
        )
        return (function() end)
    end
end

return gt_machine
