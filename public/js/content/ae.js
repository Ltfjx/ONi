ws.addEventListener('message', async (event) => {
    const json = JSON.parse(event.data)
    if (json.type == "layout/aeList") {
        renderLayout(json.data, document.getElementById("ae__list"))
    } else if (json.type == "layout/aeView") {
        renderLayout(json.data, document.getElementById("ae__view"), false)
    } else if (json.type == "layout/aeEdit") {
        renderLayout(json.data, document.getElementById("ae__edit"), false)
    }
})