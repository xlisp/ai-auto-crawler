const puppeteer = require('puppeteer');
const WebSocket = require('ws');
const vm = require('vm');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    devtools: true,
  });

  const page = await browser.newPage();
  await page.goto('https://linear.app/clackyai/team/C/active');

  console.log('Waiting for the user to log in...');

  await page.waitForSelector('.sc-DZnBE.itXJai', {
    timeout: 0
  });

  // Set up WebSocket server
  const wss = new WebSocket.Server({ port: 8080 });

  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', async (message) => {
      try {
        const code = message.toString();
        const context = { page, browser, console: console };
        const script = new vm.Script(code);
        const result = await script.runInNewContext(context);
        ws.send(JSON.stringify({ result }));
      } catch (error) {
        ws.send(JSON.stringify({ error: error.message }));
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  console.log('WebSocket server started on port 8080');

  // Clean up function
  const cleanup = async () => {
    await browser.close();
    process.exit();
  };

  // Handle cleanup on SIGINT (Ctrl+C)
  process.on('SIGINT', cleanup);
})();

