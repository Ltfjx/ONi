local ocComponent = require("component")
local oc_error = require("oni/oc_error")
local json = require("dkjson")
local ocUuid = require("uuid")


local file = "/lib/oni/ae.lua"

ae = {}

local maxHistoryTask = 100

local aeComponents = {}

-- craftTaskQueue 和 queuePointer 共同组成一个大小为 maxHistoryTask 的循环队列
-- craftTaskQueue: queue index -> craft uuid
-- craftTasks: craft uuid -> crafting status
local craftTasks = {}
local carftTaskQueue = {}
local queuePointer = 1

function ae.updateAeComponents()
    aeComponents = {}

    -- 所有的 AE 组件均以 "me_" 开头
    for k, v in pairs(ocComponent.list("me_")) do
        aeComponents[k] = ocComponent.proxy(k)
    end
end

function ae.getAeComponents(ws, taskUuid)
    local message = {
        type = "data/AE",
        data = {
            taskUuid = taskUuid,
            components = {}
        }
    }

    for k, v in pairs(aeComponents) do
        message.data.components[#message.data.components + 1] = k
    end

    ws:send(json.encode(message))
end

function ae.getCpus(ws, taskUuid, uuid)
    local comp = aeComponents[uuid]

    local message = {
        type = "data/ae",
        data = {
            type = "cpus",
            taskUuid = taskUuid,
            data = {}
        }
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
        }
        if output ~= nil then
            info.finalOutput = {
                name = output.name,
                damage = output.damage,
                count = output.size
            }
        end

        message.data.data[#message.data.data + 1] = info
    end

    ws:send(json.encode(message))
end

-- 在 uuid 表示的 AE 部件所在的网络下单数量为 amount 的物品
-- 物品 id（游戏内物品描述中形如 minecraft:stone 的部分）为 name，物品 damage（游戏内物品 id 斜杠后的部分）为 damage
-- 发送一个包含 craftUuid 的信息，用于调用 check 函数查询合成状态
-- 发送的信息格式如下：
-- {
--     "type": "data/craftRequest",
--     "data": {
--         "craftUuid": "...",
--         "taskUuid": "..."
--     }
-- }
-- TODO: 支持含有不同 NBT 的物品合成
function ae.request(ws, taskUuid, uuid, name, damage, amount)
    local comp = aeComponents[uuid]

    if name == nil or damage == nil or amount == nil then
        oc_error.raise(ws,
            "missing necessary argument",
            file,
            "request",
            taskUuid
        )
        return
    end

    local craftable = comp.getCraftables({ name = name, damage = damage })

    if #craftable == 0 then
        oc_error.raise(ws,
            "no item with name = " .. name .. ", damage = " .. damage,
            file,
            "request",
            taskUuid
        )
        return
    end

    if #craftable > 1 then
        oc_error.raise(ws,
            "Craft same items with different nbt is not supported now. name = " .. name .. ", damage = " .. damage,
            file,
            "request",
            taskUuid
        )
        return
    end

    if carftTaskQueue[queuePointer] ~= nil then
        craftTasks[carftTaskQueue[queuePointer]] = nil
    end
    carftTaskQueue[queuePointer] = ocUuid.next()

    craftTasks[carftTaskQueue[queuePointer]] = craftable[1].request(amount)

    local message = {
        type = "data/craftRequest",
        data = {
            taskUuid = taskUuid,
            craftUuid = carftTaskQueue[queuePointer]
        }
    }

    queuePointer = queuePointer + 1

    if queuePointer > maxHistoryTask + 1 then
        queuePointer = 1
    end

    ws:send(json.encode(message))
end

-- 使用 craft uuid 查询合成状态
-- 发送的合成信息格式如下：
-- {
--     "type": "data/craftStatus",
--     "data": { "canceled": false, "done": true, "computing": false, "failed": false }
-- }
function ae.check(ws, taskUuid, craftUuid)
    local status = craftTasks[craftUuid]

    if status == nil then
        oc_error.raise(ws,
            "invalid craft uuid or uuid expired",
            file,
            "check",
            taskUuid
        )
        return
    end

    local message = {
        type = "data/craftStatus",
        data = {
            taskUuid = taskUuid,
            computing = status.isComputing(),
            failed = status.hasFailed(),
            canceled = status.isCanceled(),
            done = status.isDone()
        }
    }

    ws:send(json.encode(message))
end

-- 查询网络中存储的所有物品/流体
-- 返回信息格式为：
-- {
--     "type" = "data/aeItemList",
--     "data" = {
--         "taskUuid" = taskUuid,
--         "itemList" = itemList
--     }
-- }
-- 每个物品的格式为：
-- {
--     "name": <string>,
--     "damage": <integer>,
--     "craftable": <bool>,
--     "amount": <integer>,
--     "isFluid": <bool>
-- }
-- TODO: 加入 tag 以区分含有不同 NBT 的物品
function ae.getItems(ws, taskUuid, uuid)
    local comp = aeComponents[uuid]

    local itemList = {}

    for k, v in pairs(comp.getItemsInNetwork()) do
        local item = {
            name = v.name,
            damage = v.damage,
            craftable = v.isCraftable,
            amount = v.amount,
            isFluid = false
        }
        itemList[#itemList + 1] = item
    end

    for k, v in pairs(comp.getFluidsInNetwork()) do
        local item = {
            name = v.name,
            damage = v.damage, -- fluids seems having no damage, this should be nil
            craftable = v.isCraftable,
            amount = v.amount,
            isFluid = true
        }
        itemList[#itemList + 1] = item
    end

    local message = {
        type = "data/aeItemList",
        data = {
            taskUuid = taskUuid,
            itemList = itemList
        }
    }

    ws:send(json.encode(message))
end

-- 返回与 config 内容对应的处理任务的函数
-- config 中 mode 参数可以为："getCpus", "request", "check", "getItems"
-- config 参数请查看对应函数的描述
-- TODO: 自动写样板
function ae.newTask(ws, taskUuid, config)
    ae.updateAeComponents()

    if config.uuid == nil then
        for k, v in pairs(aeComponents) do
            config.uuid = k
            break
        end
    end

    if config.uuid == nil then
        oc_error.raise(ws,
            "no AE component attached",
            file,
            "newTask",
            taskUuid
        )
        return function() end
    end

    if aeComponents[config.uuid] == nil then
        oc_error.raise(ws,
            "AE component with uuid = " .. config.uuid .. " dosen't exist",
            file,
            "newTask",
            taskUuid
        )
        return function() end
    end

    if config.mode == "getCpus" then
        return (function()
            ae.getCpus(ws, taskUuid, config.uuid)
        end)
    elseif config.mode == "getComponent" then
        return (function()
            ae.getAeComponents(ws, taskUuid)
        end)
    elseif config.mode == "request" then
        return (function()
            ae.request(ws, taskUuid, config.uuid, config.name, config.damage, config.amount)
        end)
    elseif config.mode == "check" then
        return (function()
            ae.check(ws, taskUuid, config.craftUuid)
        end)
    elseif config.mode == "getItems" then
        return (function()
            ae.getItems(ws, taskUuid, config.uuid)
        end)
    end
end

return ae
