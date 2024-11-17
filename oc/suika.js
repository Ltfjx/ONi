// 这里是 Suika.js，模仿 OC 的行为，用于调试 Oni。

import WebSocket from 'ws'
const ws = new WebSocket("ws://localhost:5600/ws/oc")

ws.addEventListener('message', ((event) => {
    console.log(event.data)
}))

ws.onopen = () => {
    ws.send(JSON.stringify({
        "type": "debug",
        "data": "This is a test message from Suika.js"
    }))
    ws.send(JSON.stringify({
        type: "auth/request",
        data: { token: "CWN78VN0MB00WFYIL8AN" }
    }))


    let i = 0;
    let speed = 100; // 初始发送速度（毫秒）
    const maxCount = 100; // 最多运行次数

    function sendData() {
        // 发送数据
        ws.send(JSON.stringify({
            type: "data/common",
            data: {
                uuid: "b6cdf1a8-39fd-49f2-b36c-5c464631097d",
                value: i * 100,
                max: 114514,
                avgIO: 1000 * i
            }
        }));

        i++;

        // 增加发送间隔，速度逐渐变慢
        if (i < maxCount) {
            speed += 10; // 每次增加50ms
            setTimeout(sendData, speed);
        }
    }

    // 开始发送数据
    sendData();

    ws.send(JSON.stringify({
        type: "data/event", data: {
            uuid: "00000000-0000-000000000000",
            name: "test0",
            description: "test0000",
            priority: 0,
            status: 0,
            timestamp: 0
        }
    }))
    setInterval(() => {
        ws.send(JSON.stringify({
            type: "data/event", data: {
                uuid: crypto.randomUUID(),
                name: "test0",
                description: "test0000",
                priority: 0,
                status: 0,
                timestamp: 0
            }
        }))
    }, 10000)

    ws.send(JSON.stringify({
        type: "data/aeItemList",
        data: { "itemList": [{ "isFluid": false, "craftable": true, "name": "minecraft:grass", "damage": 0, "amount": 1 }, { "isFluid": false, "craftable": false, "name": "minecraft:dirt", "damage": 0, "amount": 1 }, { "isFluid": false, "craftable": false, "name": "minecraft:redstone_lamp", "damage": 0, "amount": 1 }, { "isFluid": false, "craftable": false, "name": "minecraft:bucket", "damage": 0, "amount": 5 }, { "isFluid": false, "craftable": false, "name": "minecraft:lava_bucket", "damage": 0, "amount": 1 }, { "isFluid": false, "craftable": false, "name": "minecraft:redstone", "damage": 0, "amount": 6 }, { "isFluid": false, "craftable": false, "name": "minecraft:repeater", "damage": 0, "amount": 1 }, { "isFluid": false, "craftable": false, "name": "appliedenergistics2:tile.BlockController", "damage": 0, "amount": 1 }, { "isFluid": false, "craftable": false, "name": "appliedenergistics2:tile.BlockDrive", "damage": 0, "amount": 1 }, { "isFluid": false, "craftable": false, "name": "appliedenergistics2:tile.BlockInterface", "damage": 0, "amount": 1 }, { "isFluid": false, "craftable": false, "name": "appliedenergistics2:tile.BlockAdvancedCraftingStorage", "damage": 0, "amount": 1 }, { "isFluid": false, "craftable": false, "name": "Railcraft:machine.zeta", "damage": 4, "amount": 1 }, { "isFluid": false, "craftable": false, "name": "chisel:aluminumblock", "damage": 0, "amount": 2 }, { "isFluid": false, "craftable": false, "name": "gregtech:gt.blockmachines", "damage": 15498, "amount": 1 }, { "isFluid": false, "craftable": false, "name": "OpenComputers:adapter", "damage": 0, "amount": 3 }, { "isFluid": false, "craftable": false, "name": "OpenComputers:cable", "damage": 0, "amount": 65 }, { "isFluid": false, "craftable": false, "name": "OpenComputers:case3", "damage": 0, "amount": 1 }, { "isFluid": false, "craftable": false, "name": "OpenComputers:keyboard", "damage": 0, "amount": 1 }, { "isFluid": false, "craftable": false, "name": "OpenComputers:redstone", "damage": 0, "amount": 2 }, { "isFluid": false, "craftable": false, "name": "OpenComputers:screen3", "damage": 0, "amount": 1 }, { "isFluid": false, "craftable": false, "name": "OpenComputers:caseCreative", "damage": 0, "amount": 1 }, { "isFluid": false, "craftable": false, "name": "computronics:computronics.tapeReader", "damage": 0, "amount": 1 }, { "isFluid": false, "craftable": false, "name": "appliedenergistics2:item.ItemMultiPart", "damage": 20, "amount": 65 }, { "isFluid": false, "craftable": false, "name": "appliedenergistics2:item.ItemMultiPart", "damage": 360, "amount": 1 }, { "isFluid": false, "craftable": false, "name": "ae2fc:part_fluid_terminal", "damage": 0, "amount": 1 }, { "isFluid": false, "craftable": false, "name": "OpenComputers:item", "damage": 4, "amount": 1 }, { "isFluid": false, "craftable": false, "name": "computronics:computronics.tape", "damage": 9, "amount": 1 }, { "isFluid": true, "craftable": false, "name": "water", "amount": 3000 }, { "isFluid": true, "craftable": false, "name": "lava", "amount": 2000 }], "uuid": "961bd7fd-89e6-47c4-a4a9-94bd52911c37" }
    }))

}
