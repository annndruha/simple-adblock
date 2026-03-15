function split_value(value) {
    return value.split('||||abs_rand_string||||', 2)
}

function join_value(domain, selector) {
    return domain + '||||abs_rand_string||||' + selector
}

function changeContent(current_domain, rules) {
    let ruleset = ''

    for (const [datetime_key, rule] of Object.entries(rules)) {
        try {
            const [domain, selector] = split_value(rule)
            if (current_domain == domain) {
                ruleset += `
${selector} {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}
`
            }
        } catch (e) {
            console.log(e)
        }
    }

    // Apply css
    const style = document.createElement('style')
    style.textContent = ruleset
    document.documentElement.appendChild(style)
    console.log(`[Simple adblock] Current ruleset for: ${current_domain}`, ruleset)
}

function applyRules() {
    chrome.storage.sync.get(null, (res) => {
        let url = document.location.href // TODO: Filter for extention id (if script run from main)
        url = new URL(url)
        const current_domain = url.hostname
        changeContent(current_domain, res)
    })
}

applyRules()




// ======================================================== Callbacks for background.js
let lastClickedElement = null

// Track right-clicked element
document.addEventListener(
    'contextmenu',
    (event) => {
        lastClickedElement = event.target
    },
    true,
)

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'disableElement' && lastClickedElement) {
        // DEBUG
        lastClickedElement.style.display = 'none'
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
