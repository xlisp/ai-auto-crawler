const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Set this to false so you can manually log in
    slowMo: 50, // Optional: slow down operations to make them more human-like
  });

  const page = await browser.newPage();
  await page.goto('https://linear.app/clackyai/team/C/active');

  // Wait for the login page and give time to the user to log in
  console.log('Waiting for the user to log in...');

  // Wait for a specific element after login, adjust selector as needed
  await page.waitForSelector('.sc-DZnBE.itXJai', {
    timeout: 60 * 1000 // Wait indefinitely, remove if you want a specific timeout
  });

  // Now that login is complete and elements are available, get the elements
  const elements = await page.$$eval('.sc-DZnBE.itXJai', els => els.map(el => el.innerText));

  // Log the retrieved elements
  console.log(elements);

  // Close browser after task
  await browser.close();
})();

