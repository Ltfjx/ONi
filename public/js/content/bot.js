ws.addEventListener('message', async (event) => {
    const json = JSON.parse(event.data)
    if (json.type == "layout/botList") {
        renderLayout(json.data, document.getElementById("bot__list"))
    }
})