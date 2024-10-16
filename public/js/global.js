var globalCommonData = []
var globalMcServerStatus = {}
var globalBot = []

ws.addEventListener('message', function (event) {
    const json = JSON.parse(event.data)
    if (json.type == "global/data") {
        globalCommonData = json.data
    } else if (json.type == "global/mcServerStatus") {
        globalMcServerStatus = json.data
    } else if (json.type == "global/bot") {
        globalBot = json.data
    }
})