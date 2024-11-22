var globalCommonData = []
var globalMcServerStatus = {}
var globalBot = []
var globalBotTask = []
var globalAe = []


ws.addEventListener('message', function (event) {
    const json = JSON.parse(event.data)

    if (json.type == "global/data") {
        globalCommonData = json.data
    } else if (json.type == "data/common") {
        json.data.forEach(element => {
            let target = globalCommonData.find(data => data.uuid === element.uuid)
            if (target) {
                Object.assign(target, element)
            } else {
                globalCommonData.push(element)
            }
        })
    }

    else if (json.type == "global/bot") {
        globalBot = json.data
    } else if (json.type == "data/bot") {
        json.data.forEach(element => {
            let target = globalBot.find(bot => bot.uuid === element.uuid)
            if (target) {
                Object.assign(target, element)
            } else {
                globalBot.push(element)
            }
        })
    } else if (json.type == "global/botTask") {
        globalBotTask = json.data
        dialog__botTaskUpdate()
    }

    else if (json.type == "global/ae") {
        globalAe = json.data
    } else if (json.type == "data/ae") {
        json.data.forEach(element => {
            let target = globalAe.find(ae => ae.uuid === element.uuid)
            if (target) {
                Object.assign(target, element)
            } else {
                globalAe.push(element)
            }
        })
    }

    else if (json.type == "global/mcServerStatus") {
        globalMcServerStatus = json.data
    }
})