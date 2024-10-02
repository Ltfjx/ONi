local component = require("oni/component")
local oc_error = require("oni/oc_error")
local sides = require("sides")
local json = require("dkjson")

local file = "/lib/oni/redstone.lua"

redstone = {}

local redstoneComponents = {}

function redstone.isRedstoneEnabled()
    local enabled = false

    for address, name in component.list("redstone", false) do
        enabled = true
        table.insert(redstoneComponents, component.proxy(address))
    end

    return enabled
end

function redstone.updateComponent()
    redstoneComponents = {}
    for address, name in component.list("redstone", false) do
        table.insert(redstoneComponents, component.proxy(address))
    end
end

-- for less code, we ignore the color parameter
function redstone.setOutput(ws, uuid, taskUuid, side, color, strength)
    redstone.updateComponent()
    if strength == nil then
        strength = 255
    end

    if redstoneComponents[uuid] == nil then
        oc_error.raise(ws,
            "redstone I/O with uuid = " .. uuid .. " dosen't exist",
            file,
            "setOutput",
            taskUuid
        )
        return
    end

    if strength > 255 or strength < 0 then
        oc_error.raise(
            "redstone strength: " .. tostring(strength) .. " out of bound (0 ~ 255)",
            file,
            "setOutput",
            taskUuid
        )
    end

    if side ~= nil then
        redstoneComponents[uuid].setOutput(side, strength)
    else
        for s = 0, 5 do
            redstoneComponents[uuid].setOutput(s, strength)
        end
    end
end

function redstone.setBundledOutput(ws, uuid, taskUuid, side, color, strength)
    redstone.updateComponent()
    if strength == nil then
        strength = 255
    end

    if redstoneComponents[uuid] == nil then
        oc_error.raise(ws,
            "redstone I/O with uuid = " .. uuid .. " dosen't exist",
            file,
            "setBundledOutput",
            taskUuid
        )
        return
    end

    if strength > 255 or strength < 0 then
        oc_error.raise(
            "redstone strength: " .. tostring(strength) .. " out of bound (0 ~ 255)",
            file,
            "setBundledOutput",
            taskUuid
        )
    end

    local sideMin, sideMax, colorMin, colorMax

    if side == nil then
        sideMin = 0
        sideMax = 5
    else
        sideMin = side
        sideMax = side
    end

    if color == nil then
        colorMin = 0
        colorMax = 15
    else
        colorMin = color
        colorMax = color
    end

    for s = sideMin, sideMax do
        for c = colorMin, colorMax do
            redstoneComponents[uuid].setBundledOutput(side, color, strength)
        end
    end
end

function redstone.getInput(ws, uuid, taskUuid, side)
    redstone.updateComponent()

    if redstoneComponents[uuid] == nil then
        oc_error.raise(ws,
            "redstone I/O with uuid = " .. uuid .. " dosen't exist",
            file,
            "getInput",
            taskUuid
        )
        return
    end

    local message = {
        type = "data/redstone",
        data = {
            taskUuid = taskUuid,
            allColor = false,
            allSides = false,
            data = {}
        }
    }

    if side == nil then
        message.data.allSides = true
    end

    if side ~= nil then
        message.data.data = redstoneComponents[uuid].getInput(side)
        ws:send(json.encode(message))
        return
    end

    local result = redstoneComponents[uuid].getInput()
    for s = 0, 5 do
        message.data.data[sides[s]] = result[s]
    end
    ws:send(json.encode(message))
end

function redstone.getBundledInput(ws, uuid, taskUuid, side, color)
    redstone.updateComponent()

    if redstoneComponents[uuid] == nil then
        oc_error.raise(ws,
            "redstone I/O with uuid = " .. uuid .. " dosen't exist",
            file,
            "getBundledInput",
            taskUuid
        )
        return
    end

    local message = {
        type = "data/redstone",
        data = {
            taskUuid = taskUuid,
            allColor = false,
            allSides = false,
            data = {}
        }
    }

    if side == nil then
        message.data.allSides = true
    end

    if color == nil then
        message.data.allColor = true
    end

    if side ~= nil then
        if color ~= nil then
            message.data.data = redstoneComponents[uuid].getBundledInput(side, color)
            ws:send(json.encode(message))
            return
        end

        message.data.data = redstoneComponents[uuid].getBundledInput(side)
        ws:send(json.encode(message))
        return
    end

    if color == nil then
        local result = redstoneComponents[uuid].getBundledInput()
        for s = 0, 5 do
            message.data.data[sides[s]] = result[s]
        end
        ws:send(json.encode(message))
        return
    end

    for s = 0, 5 do
        message.data.data[sides[s]] = redstoneComponents[uuid].getBundledInput(s, color)
    end
    ws:send(json.encode(message))
end

function redstone.getOutput(ws, uuid, taskUuid, side)
    redstone.updateComponent()

    if redstoneComponents[uuid] == nil then
        oc_error.raise(ws,
            "redstone I/O with uuid = " .. uuid .. " dosen't exist",
            file,
            "getOutput",
            taskUuid
        )
        return
    end

    local message = {
        type = "data/redstone",
        data = {
            taskUuid = taskUuid,
            allColor = false,
            allSides = false,
            data = {}
        }
    }

    if side == nil then
        message.data.allSides = true
    end

    if side ~= nil then
        message.data.data = redstoneComponents[uuid].getOutput(side)
        ws:send(json.encode(message))
        return
    end

    local result = redstoneComponents[uuid].getOutput()
    for s = 0, 5 do
        message.data.data[sides[s]] = result[s]
    end
    ws:send(json.encode(message))
end

function redstone.getBundledOutput(ws, uuid, taskUuid, side, color)
    redstone.updateComponent()

    if redstoneComponents[uuid] == nil then
        oc_error.raise(ws,
            "redstone I/O with uuid = " .. uuid .. " dosen't exist",
            file,
            "getBundledOutput",
            taskUuid
        )
        return
    end

    local message = {
        type = "data/redstone",
        data = {
            taskUuid = taskUuid,
            allColor = false,
            allSides = false,
            data = {}
        }
    }

    if side == nil then
        message.data.allSides = true
    end

    if color == nil then
        message.data.allColor = true
    end

    if side ~= nil then
        if color ~= nil then
            message.data.data = redstoneComponents[uuid].getBundledOutput(side, color)
            ws:send(json.encode(message))
            return
        end

        message.data.data = redstoneComponents[uuid].getBundledOutput(side)
        ws:send(json.encode(message))
        return
    end

    if color == nil then
        local result = redstoneComponents[uuid].getBundledOutput()
        for s = 0, 5 do
            message.data.data[sides[s]] = result[s]
        end
        ws:send(json.encode(message))
        return
    end

    for s = 0, 5 do
        message.data.data[sides[s]] = redstoneComponents[uuid].getBundledOutput(s, color)
    end
    ws:send(json.encode(message))
end

-- 返回与config内容对应的处理任务的函数
-- config 中 mode 参数可以为："setOutput", "getOutput", "getInput", 以及它们的Bundled版本
-- side 参数可以为："up", "down", "north", "south", "east", "west"
-- 当 side 参数缺省时，会获取/设置所有面的红石信号
-- 只有调用 Bundled 版本的函数时 color 参数才有效
-- color 参数可以为 16 种颜色，具体颜色请参考游戏或 OC 文档（使用0 ~ 15指定颜色）
-- 当 color 参数缺省时，会获取/设置所有颜色的红石信号
-- 只有使用 "setOutput" 以及 "setBundledOutput" 时 strenth 参数才有效
-- 使用 "setOutput" 和 "setBundledOutput" 时，strength 参数取值范围为 0 ~ 255
-- 若缺省 strength 参数，则默认值为 255
-- 任务执行结果：
-- 以 set 开头的函数除非报错，否则不会返回任何信息
-- 以 get 开头的函数返回信息包含布尔值 "allSides" 和 "allColor"， 表示是否缺省了对应参数（非 Bundled 版本 "allColor" 总是为 false）
-- 数据包含在 "data" 中
-- 当缺省 side 时，"data" 中包含六个方向的键值
-- 当 Bundled 版本缺省 color 时，返回值中的数值会被更换为包含 16 个元素的数组
-- TODO: wireless
function redstone.newTask(ws, taskUuid, config)
    return (function()
        redstone[config.mode](ws, config.uuid, taskUuid, config.side, config.color, config.strength)
    end)
end

return redstone
