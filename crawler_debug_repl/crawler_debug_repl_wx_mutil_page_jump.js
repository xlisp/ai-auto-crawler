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

  await page.waitForSelector('.go_publish_history_link', {
    timeout: 30 * 1000 // Wait indefinitely until the element is available after login
  });

  console.log('Login completed. Navigating to publish history...');

  // Get the href attribute of the go_publish_history_link
  const token = await page.evaluate(() => {
      const url = document.URL
      return new URL(url).searchParams.get("token")
  });

  if (token) {
    // Navigate to the publish history page
    await page.goto(`https://mp.weixin.qq.com/cgi-bin/appmsgpublish?sub=list&begin=0&count=10&token=${token}&lang=zh_CN`);
    console.log('Navigated to publish history page.');
  } else {
    console.error('Could not find the publish history link.');
  }

  // Wait for the content to load on the new page
  //await page.waitForSelector('.weui-desktop-mass-send__list', {
  //  timeout: 30000 // Wait for up to 30 seconds
  //});

  console.log('Publish history page loaded.');

  console.log('Entering REPL mode. You can interact with the publish history page.');
  const replServer = repl.start('> ');

  // Make the `page` object available in the REPL
  replServer.context.page = page;
  replServer.context.browser = browser;

  // Use `Ctrl+C` twice to exit the REPL and close the browser when done.
})();
