local computer = require("computer")

component = {}

local previous_component = {}

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

function component.update()
    local componentTable = {}
    local componentList = component.getComponent()

    -- print(table_length(previous_component))

    for k, v in pairs(componentList) do
        componentTable[v.uuid] = {
            class = v.class,
            description = v.description
        }
    end

    if #previous_component ~= #componentList then
        previous_component = componentList
        return true, componentList
    end

    for k, v in pairs(previous_component) do
        if componentTable[v.uuid] == nil then
            -- print(k, v.uuid, componentTable[v.uuid].description)
            previous_component = componentList
            return true, componentList
        end
    end

    return false, componentList
end

return component
