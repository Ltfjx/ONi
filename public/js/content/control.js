ws.addEventListener('message', async (event) => {
    const raw = JSON.parse(event.data)
    if (raw.type == "layout/control") {
        renderLayout(raw.data,document.getElementById("control__content"))
    }
})