ws.addEventListener('message', async (event) => {
    const json = JSON.parse(event.data)
    if (json.type == "layout/control") {
        renderLayout(json.data,document.getElementById("control__content"))
    }
})