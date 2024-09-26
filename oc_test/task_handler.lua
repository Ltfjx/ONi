local webSocket = require("ws")
local event = require("event")
local json = require("dkjson")

local address = "localhost"
local port = 5600
local path = "/ws/oc"

local uuid = "12345678-1234-1234-1234-123456789abc"

local ws = webSocket.new({
    address = address,
    port = port,
    path = path
})

function await_message()
    while true do
        local messageType, message, err = ws:readMessage()
        if err then return print('Websocket Error: ' .. err) end
        if messageType == webSocket.MESSAGE_TYPES.TEXT then
            print('Message Received: ' .. message)
            return message
        end
    end
end

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

-- login
ws:send(json.encode({
    type = "auth/request",
    data = {
        token = "CWN78VN0MB00WFYIL8AN"
    }
}))

function updateComponent()
    local modified, componentList = component.update()
    if modified then
        local message = {
            type = "component",
            data = {
                components = componentList
            }
        }
        print(json.encode(message))
        ws:send(json.encode(message))
    end
end

print(await_message())

event.timer(3, updateComponent, math.huge)

while true do
    os.sleep(2)
end
