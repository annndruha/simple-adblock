function changeContent(domain, rules) {
    let n_rules = Object.keys(rules).length

    let ruleset = ''
    for (let i = 1; i < n_rules + 1; i++) {
        try {
            const rule = rules[i]
            const [domain_key, selector] = split_value(rule)

            if (domain == domain_key) {
              ruleset += `
                        ${selector} {
                          display: none !important;
                          visibility: hidden !important;
                          opacity: 0 !important;
                          pointer-events: none !important;
                        }
                      `
            }
        }
        catch (e) {
            console.log(e)
        }
    }

    // Apply css
    const style = document.createElement('style');
    style.textContent = ruleset
    document.documentElement.appendChild(style)
}

function applyRules() {
    chrome.storage.local.get(null, (res)=> {
        let url = document.location.href // TODO: Filter for extention id (if script run from main)
        url = new URL(url)
        const domain = url.hostname
        changeContent(domain, res)
    })
}


// function retryApplyRules() {
//     applyRules()
//     setTimeout(() => {
//         retryApplyRules()
//     }, 2000)
// }

// retryApplyRules()


// Метод 2
// const style = document.createElement('style');
// style.textContent = `
//   .direct {
//     display: none !important;
//     visibility: hidden !important;
//     opacity: 0 !important;
//     pointer-events: none !important;
//   }
// `;
// document.documentElement.appendChild(style);



let lastClickedElement = null;

// Track right-clicked element
document.addEventListener('contextmenu', (event) => {
    lastClickedElement = event.target;
}, true);

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'disableElement' && lastClickedElement) {
        // DEBUG
        lastClickedElement.style.display = 'none';
        // lastClickedElement = null;

        let idx = new Date().getTime().toString(36)
        const url = new URL(document.location.href)
        const domain = url.hostname

        let json = {}
        json[idx] = domain + '||||abs_rand_string||||' + '.' + String(lastClickedElement.className)
        chrome.storage.sync.set(json, (res) => {
            console.log('json set', res)
        })
    }
})