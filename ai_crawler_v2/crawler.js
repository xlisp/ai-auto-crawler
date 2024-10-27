
const puppeteer = require('puppeteer');

async function crawl(url, customCode) {
    const browser = await puppeteer.launch({
        headless: 'new'
    });
    const page = await browser.newPage();
    
    // Initialize result object
    let result = {};
    
    try {
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Execute custom crawling code
        result = await page.evaluate(async (customCode) => {
            // The custom code will be injected here
            const customFunction = new Function('return ' + customCode)();
            return await customFunction();
        }, customCode);

    } catch (error) {
        console.error(JSON.stringify({ error: error.message }));
    } finally {
        await browser.close();
    }
    
    return result;
}

// Handle input from Python
process.stdin.on('data', async (data) => {
    const { url, customCode } = JSON.parse(data);
    try {
        const result = await crawl(url, customCode);
        console.log(JSON.stringify(result));
    } catch (error) {
        console.error(JSON.stringify({ error: error.message }));
    }
    process.exit(0);
});
