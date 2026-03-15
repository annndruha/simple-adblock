chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create(
        {
            id: '3dgds7Ed2MAFJkBzuS3x9UrX',
            title: 'Disable element',
            type: 'normal',
            contexts: ['page'],
        },
        () => {},
    )
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === '3dgds7Ed2MAFJkBzuS3x9UrX') {
        // Get the ID of the clicked element
        const elementId = info.targetElementId;
        
        // Send a message to the content script with the element ID
        chrome.tabs.sendMessage(tab.id, {
            action: 'disableElement',
            targetElementId: elementId
        });
    }
})