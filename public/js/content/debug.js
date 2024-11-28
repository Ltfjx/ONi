ws.addEventListener('message', async (event) => {
    const json = JSON.parse(event.data)
    if (json.type == "global/bot") {
        const e = document.getElementById("debug__ws-select-bot")
        let _ = ""
        globalBot.forEach(bot => {
            _ += `<mdui-menu-item value="${bot.uuid}">${bot.name}</mdui-menu-item>`
        })
        e.innerHTML = _
    }
})

document.getElementById("debug__ws-button-send").addEventListener("click", async () => {
    const data = document.getElementById("debug__ws-input").value
    const target = document.getElementById("debug__ws-select-bot").value
    ws.send(JSON.stringify({ type: "oc/forward", target: target, data: JSON.parse(data) }))
})

// document.getElementById("ae__item-info-dialog").open = true