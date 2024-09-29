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

// Initialize a new Map to group by 'name'
const groupedByName = new Map();

// Group the issueMap by 'name'
issueMap.forEach((value, issueCode) => {
    const { name, text } = value;
    
    // If the name doesn't exist, initialize an empty array
    if (!groupedByName.has(name)) {
        groupedByName.set(name, []);
    }

    // Push the issueCode and corresponding text into the array for that name
    groupedByName.get(name).push({ issueCode, text });
});

// Log the grouped results by 'Name'
groupedByName.forEach((issues, name) => {
    console.log(`======= Name: ${name}`);
    issues.forEach(issue => {
        console.log(`  Issue Code: ${issue.issueCode}, Text: ${issue.text}`);
    });
});

