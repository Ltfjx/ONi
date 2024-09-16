ws.addEventListener("message", async (event) => {
    const raw = JSON.parse(event.data)
    if (raw.type == "layout/overview") {
        // 构建 Overview 页面
        const layout = raw.data
        const componentList = await fetch("ejs/components.json").then(r => r.json())
        const e = document.getElementById("overview__content")
        console.log(layout)
        var result = ""
        var scriptList = new Set()
        for (let block of layout) {
            let inner = ""
            for (let item of block.content) {
                const template = await fetch(`ejs/${item.type}/${item.id}.ejs`).then(r => r.text())
                if (componentList.item[item.type].filter(c => c.id == item.id)[0].have_script) {
                    scriptList.add(`ejs/${item.type}/${item.id}.js`)
                }
                inner += ejs.render(template, item.config)
            }

            const blockTemplate = await fetch(`ejs/${block.type}.ejs`).then(r => r.text())
            result += ejs.render(blockTemplate, { inner: inner })
        }


        scriptList.forEach(async (url) => {
            console.log(url)
            const script = await fetch(url).then(r => r.text())
            eval(script)
        })


        e.innerHTML = result
    }
}
)