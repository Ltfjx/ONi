var debug__log = ""

function debug__addLog(text) {
    const e = document.getElementById('debug__log')
    debug__log += text + "\n"
    e.textContent = debug__log
    debug__highlightLog()
}

function debug__highlightLog() {
    const e = document.getElementById('debug__log')
    e.removeAttribute("data-highlighted")
    hljs.highlightElement(e)
}

ws.addEventListener('message', async (event) => {
    const json = JSON.parse(event.data)
    if (json.type == "event/log") {
        debug__addLog(json.data)
    }
})