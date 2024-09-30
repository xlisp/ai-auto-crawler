// Find all elements with the class 'weui-desktop-block'
let blocks = document.querySelectorAll('.weui-desktop-block');

// Iterate through each block and extract the desired content
blocks.forEach(block => {
    // Extract the title
    let titleElement = block.querySelector('.weui-desktop-mass-appmsg__title');
    let title = titleElement ? titleElement.textContent.trim() : 'No title';

    // Extract the reading count
    let readCountElement = block.querySelector('.weui-desktop-mass-media__data.appmsg-view .weui-desktop-mass-media__data__inner');
    let readCount = readCountElement ? readCountElement.textContent.trim() : 'No read count';

    // Log the result
    console.log(`Title: ${title}, Read Count: ${readCount}`);
});

