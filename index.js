const puppeteer = require('puppeteer');
const fs = require('fs');
const download = require('image-downloader');

async function main(){
    const url = 'https://www.pinterest.com/pin/1151443829710550625/';
    const dir = './result';
    const dirDefault = './node_modules/image-downloader/result';
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // Scroll down to load all image;
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            let distance = 100;
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });

    // Get image url;
    const imageUrls = await page.$$eval(
        'img[src^="https"]',
        (images) => images.map((image) => image.src)
      );

    // Create result folder if not exist;
    if(!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    if(!fs.existsSync(dirDefault)){
        fs.mkdirSync(dirDefault);
    }

    // Download image;
    for(const imageUrl of imageUrls){
        const options = {
            url: imageUrl,
            dest: dir,
        }
        download.image(options);
    }

    console.log(imageUrls);
    await browser.close();
}
main();
