ws.addEventListener('message', function (event) {
    const json = JSON.parse(event.data)
    if (json.type == "layout/overview") {
        renderLayout(json.data, document.getElementById("overview__content"))
    }
})