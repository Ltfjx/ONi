var globalCommonData = []
var globalMcServerStatus = {}

ws.addEventListener('message', function (event) {
    const json = JSON.parse(event.data)
    if (json.type == "global/commonData") {
        globalCommonData = json.data
    } else if (json.type == "global/mcServerStatus") {
        globalMcServerStatus = json.data
    }
})