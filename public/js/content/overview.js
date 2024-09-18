ws.addEventListener('message', function (event) {
    const raw = JSON.parse(event.data)
    if (raw.type == "layout/overview") {
        renderLayout(raw.data, document.getElementById("overview__content"))
    }
})