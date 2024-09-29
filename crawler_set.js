const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Set this to false so you can manually log in
    slowMo: 50, // Optional: slow down operations to make them more human-like
  });

  const page = await browser.newPage();
  await page.goto('https://linear.app/clackyai/team/C/active');

  // Wait for the login process and specific elements after login
  console.log('Waiting for the user to log in...');

  await page.waitForSelector('.sc-DZnBE.itXJai', {
    timeout: 120 * 1000 // Wait indefinitely for the login to finish
  });

  // Now that login is complete and elements are available, extract data
  const issueMap = new Map();

  const elements = await page.$$eval('.sc-DZnBE.itXJai', els => {
    const issues = new Map();

    els.forEach(element => {
      // Find the issue code like 'C-986'
      const issueCode = element.querySelector('span.sc-dmyCSP.dzApaP')?.innerText;

      // Find the text content like '【视角跟随】...'
      const parsedText = element.querySelector('span.sc-dmyCSP.sc-gunAVc')?.innerText;

      // Find the name using the aria-label attribute from the img tag
      const name = element.querySelector('img[aria-label]')?.getAttribute('aria-label');

      // If all data is available and issueCode is unique, add it to the Map
      if (issueCode && parsedText && name && !issues.has(issueCode)) {
        issues.set(issueCode, { name, text: parsedText });
      }
    });

    return Array.from(issues.entries()); // Return an array of [key, value] pairs
  });

  // Log the retrieved issues
  console.log('Extracted issues:');
  elements.forEach(([issueCode, { name, text }]) => {
    console.log(`Issue: ${issueCode}, Name: ${name}, Text: ${text}`);
  });

  // Close the browser after extraction
  await browser.close();
})();

