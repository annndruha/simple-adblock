function changeContent(rules) {
    let n_rules = Object.keys(rules).length
    console.log('Applying %i rules to this page.', n_rules)
    console.log('Rules:', rules)
    for (let i = 1; i < n_rules+1; i++) {
        try {
            let rule = rules[i]
            let property = rule['property']
            let value = rule['value']
            let selector = rule['selector']
            let el = document.querySelector(selector)
            el.style.setProperty(property, value)
        }
        catch (e) {
            console.log(e)
        }
    }
}

function applyRules() {
    chrome.storage.local.get(null, (res)=> {
        let url = document.location.href // TODO: Filter for extention id (if script run from main)
        url = new URL(url)
        const domain = url.hostname
        let rules = res[domain]
        changeContent(rules)
    })
}


function retryApplyRules() {
    applyRules()
    setTimeout(() => {
        retryApplyRules()
    }, 2000)
}

retryApplyRules()


// =====================================================================================================================
// chrome.storage.local.get(null, (res)=> {
//     console.log('local.get')
//     console.log(res)
//     let rule = res[0]
//     let property = rule['property']
//     let value = rule['value']
//     console.log(property, value)
//     let el = document.querySelector('body')
//     console.log(el)
//     el.style.setProperty(property, value)
//     chrome.tabs.query({active: true}, function(tabs){
//         chrome.scripting.executeScript({
//             target: {tabId: tabs[0].id},
//             function: reddenPage,
//             args: [tabs[0].url]
//         })
//         console.log(tabs[0].url)
//     })
// })

// chrome.tabs.query({active: true}, function(tabs){
//     console.log(tabs)
//     chrome.runtime.getURL()
//     chrome.scripting.executeScript({
//         target: {tabId: tabs[0].id},
//         function: changeContent
//         //args: [tabs[0].url]
//     })
//     console.log(tabs[0].url)
// })

// var consoleGreeting = "Hello World! - from event_script.js";
// var ruleStackOverflowHost = {
//     "conditions" : [
//         new chrome.declarativeContent.PageStateMatcher({
//             "pageUrl" : {
//                 "hostEquals" : "stackoverflow.com",
//                 "schemes" : ["http","https"]
//             }
//         })
//     ],
//     "actions" : [new chrome.declarativeContent.ShowPageAction()]
// };
//
// console.log(consoleGreeting);
// chrome.runtime.onInstalled.addListener(function() {
//     //Удаляем и заменяем правила
//     chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
//         //Указываем новые правила
//         chrome.declarativeContent.onPageChanged.addRules([ruleStackOverflowHost]);
//     });
// });