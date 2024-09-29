
// Get all elements with the specified class
const elements = document.querySelectorAll('.sc-DZnBE.itXJai');

// Loop through each element and parse the desired text
elements.forEach(element => {
    // Find the text content
    const parsedText = element.querySelector('span.sc-dmyCSP.sc-gunAVc')?.innerText;

    // Find the name using the aria-label attribute from the img tag
    const name = element.querySelector('img[aria-label]')?.getAttribute('aria-label');
    
    // Log the results to the console
    if (parsedText && name) {
        console.log(`Name: ${name}, Text: ${parsedText}`);
    }
});


