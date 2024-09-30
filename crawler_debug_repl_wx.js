const puppeteer = require('puppeteer');
const repl = require('repl'); // Node.js REPL for interactive debugging

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Keep it false to interact with the browser
    slowMo: 50, // Optional: slow down operations to make them more human-like
    devtools: true, // Optionally, open Chrome DevTools for further debugging
  });

  const page = await browser.newPage();
  await page.goto('https://mp.weixin.qq.com/');

  // Wait for the login process to complete by checking for a known element
  console.log('Waiting for the user to log in...');

  await page.waitForSelector('.publish_record_index', {
    timeout: 0 // Wait indefinitely until the element is available after login
  });

  // todo -----

  console.log('Entering REPL mode. You can interact with the logged-in page.');
  const replServer = repl.start('> ');

  // Make the `page` object available in the REPL
  replServer.context.page = page;
  replServer.context.browser = browser;

  // Use `Ctrl+C` twice to exit the REPL and close the browser when done.
})();
