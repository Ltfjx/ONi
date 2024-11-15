import fs from 'fs-extra';
import axios from 'axios';

const raw = JSON.parse(fs.readFileSync("output.json").toString());

const downloadLimit = 100;
let downloadQueue = [];

// 限速下载的函数
async function downloadImage(url, filename) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        await fs.outputFile(filename, response.data);
        console.log(`下载成功: ${filename}`);
    } catch (error) {
        console.error(`下载图片 ${url} 时出错:`, error.message);
    }
}

// 将下载任务加入队列
raw.forEach(liquid => {
    liquid.name = liquid.name.replace(/:/g, '');
    liquid.mod = liquid.mod.replace(/\|/g, '');
    const url = `http://shgt.online:11451/image/fluid/${liquid.mod}/${liquid.name}.png`;
    const filename = `./liquid_pics/${liquid.id}.png`;
    if (!fs.existsSync(filename)) {
        downloadQueue.push({ url, filename });
    } else {
        console.log(`文件已存在：${filename}`);
    }
});

// 限速执行下载任务
async function executeDownload() {
    for (const { url, filename } of downloadQueue) {
        await downloadImage(url, filename);
        await new Promise(resolve => setTimeout(resolve, 1000 / downloadLimit)); // 控制下载速率
    }
}

executeDownload();
