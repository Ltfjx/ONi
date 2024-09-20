var globalCommonData = []

ws.addEventListener('message', function (event) {
    const json = JSON.parse(event.data)
    if (json.type == "global/commonData") {
        globalCommonData = json.data
    }
})