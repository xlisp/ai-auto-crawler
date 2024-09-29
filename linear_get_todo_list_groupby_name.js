// Initialize a Map to store data grouped by name
const nameMap = new Map();

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

    // If all data is available, add it to the Map grouped by name
    if (issueCode && parsedText && name) {
        // Check if the name already exists in the Map
        if (!nameMap.has(name)) {
            nameMap.set(name, []);  // Initialize an array for this name
        }
        // Add the issueCode and text to the corresponding name
        nameMap.get(name).push({ issueCode, text: parsedText });
    }
});

// Log the contents of the Map grouped by name
nameMap.forEach((issues, name) => {
    console.log(`Name: ${name}`);
    issues.forEach(issue => {
        console.log(`  Issue Code: ${issue.issueCode}, Text: ${issue.text}`);
    });
});

