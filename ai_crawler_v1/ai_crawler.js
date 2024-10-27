
// crawler.js
const puppeteer = require('puppeteer');

async function crawl(url) {
    const browser = await puppeteer.launch({
        headless: 'new'
    });
    const page = await browser.newPage();
    await page.goto(url, {
        waitUntil: 'networkidle0',
    });

    const data = await page.evaluate(() => {
        // Extract text content from the page
        const textContent = document.body.innerText;
        // Extract all links
        const links = Array.from(document.querySelectorAll('a')).map(a => a.href);
        return {
            content: textContent,
            links: links
        };
    });

    await browser.close();
    return data;
}

// Handle input from Python
process.stdin.on('data', async (data) => {
    const { url } = JSON.parse(data);
    try {
        const result = await crawl(url);
        console.log(JSON.stringify(result));
    } catch (error) {
        console.error(JSON.stringify({ error: error.message }));
    }
    process.exit(0);
});
