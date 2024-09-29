const puppeteer = require('puppeteer');
const repl = require('repl'); // Node.js REPL for interactive debugging

const issueMap = new Map();  // Store the issue data

const scrollAndParse = async (page, selector) => {
  await page.evaluate(async (selector) => {
    const targetElement = document.querySelector(selector);
    if (!targetElement) {
      console.log('Target element not found');
      return;
    }

    // Find the closest scrollable container
    const container = targetElement.closest('div[style*="overflow"]') || targetElement;

    const distance = 200;  // Scroll distance
    const delay = 500;     // Delay between scrolls

    const scroll = async () => {
      return new Promise((resolve) => {
        const interval = setInterval(async () => {
          const maxScrollTop = container.scrollHeight - container.clientHeight;
          const currentScrollTop = container.scrollTop;

          container.scrollBy(0, distance);

          // Parse content after each scroll
          parseContent();

          // If we reach the bottom, stop scrolling
          if (currentScrollTop >= maxScrollTop) {
            clearInterval(interval);
            resolve();
          }
        }, delay);
      });
    };

    // Function to parse the content and add to the issueMap
    const parseContent = () => {
      // Get all elements with the specified class
      const elements = document.querySelectorAll('.sc-DZnBE.itXJai');

      // Loop through each element and parse the desired data
      elements.forEach(element => {
        // Find the issue code like 'C-986'
        const issueCode = element.querySelector('span.sc-dmyCSP.dzApaP')?.innerText;

        // Find the text content like '【视角跟随】...'
        const parsedText = element.querySelector('span.sc-dmyCSP.sc-gunAVc')?.innerText;

        // Find the name using the aria-label attribute from the img tag
        const name = element.querySelector('img[aria-label]')?.getAttribute('aria-label');

        // If all data is available and issueCode is unique, add it to the Map
        if (issueCode && parsedText && name && !issueMap.has(issueCode)) {
          issueMap.set(issueCode, { name, text: parsedText });
        }
      });

      console.log('Current Issue Map:', issueMap);
    };

    await scroll();  // Start scrolling and parsing
    console.log('Scrolling completed');
  }, selector);
};

const scrollDiv = async (page, selector) => {
  await page.evaluate(async (selector) => {
    const targetElement = document.querySelector(selector);
    if (!targetElement) {
      console.log('Target element not found');
      return;
    }

    // Find the closest scrollable container
    const container = targetElement.closest('div[style*="overflow"]') || targetElement;

    const distance = 200; // Scroll distance
    const delay = 100; // Delay between scrolls

    const scroll = () => {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          const maxScrollTop = container.scrollHeight - container.clientHeight;
          const currentScrollTop = container.scrollTop;

          container.scrollBy(0, distance);

          // If we reach the bottom, stop scrolling
          if (currentScrollTop >= maxScrollTop) {
            clearInterval(interval);
            resolve();
          }
        }, delay);
      });
    };

    await scroll();
    console.log('Scrolling completed');
  }, selector);
};


// Scroll the div with the specified class
//  const selector = '.sc-fNEhIj.fSVDhv'; // Change this as needed
//  await scrollDiv(page, selector);

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Keep it false to interact with the browser
    slowMo: 50, // Optional: slow down operations to make them more human-like
    devtools: true, // Optionally, open Chrome DevTools for further debugging
  });

  const page = await browser.newPage();
  await page.goto('https://linear.app/clackyai/team/C/active');

  // Wait for the login process to complete by checking for a known element
  console.log('Waiting for the user to log in...');

  await page.waitForSelector('.sc-DZnBE.itXJai', {
    timeout: 0 // Wait indefinitely until the element is available after login
  });

  // Extract data as per your original request
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

  // ----------
  // Scroll the div and parse the content
  const selector = '.sc-fNEhIj.fSVDhv';  // The div class to scroll and parse
  await scrollAndParse(page, selector);
  // ------

  // Enter REPL mode to interact with the `page` object for debugging
  console.log('Entering REPL mode. You can interact with the logged-in page.');
  const replServer = repl.start('> ');

  // Make the `page` object available in the REPL
  replServer.context.page = page;
  replServer.context.browser = browser;

  // Use `Ctrl+C` twice to exit the REPL and close the browser when done.
})();

