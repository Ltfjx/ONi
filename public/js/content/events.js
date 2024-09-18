ws.addEventListener('message', function (event) {
    const raw = JSON.parse(event.data)
    if (raw.type == "layout/events") {
        renderLayout(raw.data, document.getElementById("events__content"))
    }
})