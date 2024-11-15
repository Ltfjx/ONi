import fs from 'fs'

const raw = fs.readFileSync("raw.txt").toString().split("\r\n")

var data = []

for (let i = 0; i < raw.length / 5; i++) {
    data.push({
        name: raw[i * 5 + 2],
        id: raw[i * 5 + 3],
        display: raw[i * 5 + 0],
        // mod: raw[i * 5 + 1]
    })
}

fs.writeFileSync("output.json", JSON.stringify(data))