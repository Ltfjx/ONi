document.querySelectorAll(".control-redstone-analog__card").forEach(element => {
    let uuid = element.querySelector("data").getAttribute("uuid")
    let botUuid = element.querySelector("data").getAttribute("botUuid")
    let side = element.querySelector("data").getAttribute("side")

    element.querySelector("mdui-slider").addEventListener("change", event => {
        ws.send(JSON.stringify({
            "type": "oc/task",
            "target": botUuid,
            "data": [
                {
                    "task": "redstone",
                    "interval": -1,
                    "taskUuid": randomUUID(),
                    "config": {
                        "mode": "setOutput",
                        "strength": event.target.value,
                        "uuid": uuid,
                        "side": side
                    }
                }
            ]
        }))
    })
})  