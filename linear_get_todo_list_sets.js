// Initialize a Map to store unique issueCode as key and the corresponding data
const issueMap = new Map();

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

// Log the contents of the Map (hash set)
issueMap.forEach((value, key) => {
    console.log(`Issue Code: ${key}, Name: ${value.name}, Text: ${value.text}`);
});

