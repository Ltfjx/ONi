local computer = require("computer")
local thread = require("thread")
local json = require("dkjson")

component = {}

-- 保存之前的组件列表，用于判断组件是否更新
local previous_component = {}

-- 获取当前ooc设备的组件列表，返回数组
function component.getComponent()
    local componentList = {}
    local deviceInfo = computer.getDeviceInfo()

    local index = 1
    for k, v in pairs(deviceInfo) do
        componentList[index] = {
            class = v.class,
            uuid = k,
            description = v.description
        }
        index = index + 1
    end

    return componentList
end

-- 返回值类型为boolean, table
-- 第一个返回值表示组件是否更新，true表示有更新
-- 第二个返回值返回当前组件列表
function component.update()
    -- 该table存储组件uuid到组件剩余信息的映射，用于检查组件列表是否更新
    local componentTable = {}
    local componentList = component.getComponent()

    -- print(table_length(previous_component))

    for k, v in pairs(componentList) do
        componentTable[v.uuid] = {
            class = v.class,
            description = v.description
        }
    end

    -- 如果两次列表长度不一致，则肯定更新了组件
    if #previous_component ~= #componentList then
        previous_component = componentList
        return true, componentList
    end


    -- 在组件列表长度一致的情况下，下述遍历即可完全确定组件列表是否更新
    for k, v in pairs(previous_component) do
        if componentTable[v.uuid] == nil then
            -- print(k, v.uuid, componentTable[v.uuid].description)
            previous_component = componentList
            return true, componentList
        end
    end

    return false, componentList
end

-- 返回查询组件列表的函数
-- 返回的函数总是通过web socket发送一次组件列表信息
-- 无额外参数
function component.newTask(ws, config)
    return (function()
        ws:send(json.encode(component.getComponent()))
    end)
end

return component
