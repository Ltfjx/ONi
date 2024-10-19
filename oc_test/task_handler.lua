local webSocket = require("ws")
local event = require("event")
local json = require("dkjson")

local component = require("oni/component")
local redstone = require("oni/redstone")
local ae = require("oni/ae")

local address = "localhost"
local port = 5600
local path = "/ws/oc"

local uuid = "12345678-1234-1234-1234-123456789abc"

local ws = webSocket.new({
    address = address,
    port = port,
    path = path
})

-- 等待从服务器发送的web socket消息，会阻塞线程
function await_message()
    while true do
        local messageType, message, err = ws:readMessage()
        if err then return print('Websocket Error: ' .. err) end
        if messageType == webSocket.MESSAGE_TYPES.TEXT then
            print('Message Received: ' .. message)
            return message
        end
        os.sleep(0.2)
    end
end

-- 等待web socket连接建立完毕
while true do
    local connected, err = ws:finishConnect()
    if connected then
        break
    end

    if err then
        return print("failed to connect:" .. err)
    end
end

print("Successfully connected to " .. address .. ":" .. port .. path)

-- 发送登录验证信息
ws:send(json.encode({
    type = "auth/request",
    data = {
        token = "CWN78VN0MB00WFYIL8AN"
    }
}))

-- 检测oc组件是否更新并上传组件信息
function updateComponent()
    local modified, componentList = component.update()
    if modified then
        local message = {
            type = "component",
            data = {
                components = componentList
            }
        }
        -- print(json.encode(message))
        ws:send(json.encode(message))
    end
end

--login response
-- print(await_message())
await_message()

-- 定时检测并上传oc组件的更新信息
event.timer(5, updateComponent, math.huge)

-- 将任务列表中的task值映射到具体的函数
-- 函数均返回执行操作的函数对象
-- 第一个参数固定为web socket对象，用于返回信息或报错
-- 第二个参数为该任务所需的参数(table)
local executeMap = {
    component = component.newTask,
    redstone = redstone.newTask,
    ae = ae.newTask
}

-- 事件timer对象，用于终止定时任务
local taskList = {}

-- 终止所有定时任务
function cleanTask()
    for k, v in pairs(taskList) do
        event.cancel(v)
        taskList[k] = nil
    end
end

print("start listening tasks")

while true do
    os.sleep(0.2)
    local message = await_message()

    local tasks = json.decode(message)

    if tasks.type ~= "task" then
        print("received message: " .. message)
        print("unknown message type: " .. tasks.type)
        goto task_loop_continue
    end

    local list = tasks.data

    -- 如果任务列表包含任何重复任务，则终止此前的所有定时任务
    for k, v in pairs(list) do
        if v.interval ~= -1 then
            cleanTask()
            break
        end
    end

    for k, v in pairs(list) do
        if v.interval < 0 then
            event.timer(0, executeMap[v.task](ws, v.taskUuid, v.config))
        else
            -- math.huge为一个非常大的数，可以认为是无限循环
            local timerHandle = event.timer(v.interval, executeMap[v.task](ws, v.taskUuid, v.config), math.huge)
            table.insert(taskList, timerHandle)
        end
    end

    ::task_loop_continue::
end
