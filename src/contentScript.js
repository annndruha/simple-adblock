// function changeContent(rules) {
//     let n_rules = Object.keys(rules).length
//     console.log('Applying %i rules to this page.', n_rules)
//     console.log('Rules:', rules)
//     for (let i = 1; i < n_rules + 1; i++) {
//         try {
//             const rule = rules[i]
//             const elements = document.querySelectorAll(rule.selector)
//             console.log('Matched elements:', elements)
//             elements.forEach(function (el) {
//                 el.style.setProperty(rule.property, rule.value)
//             })
//         }
//         catch (e) {
//             console.log(e)
//         }
//     }
// }

// function applyRules() {
//     chrome.storage.local.get(null, (res)=> {
//         let url = document.location.href // TODO: Filter for extention id (if script run from main)
//         url = new URL(url)
//         const domain = url.hostname
//         let rules = res[domain]
//         changeContent(rules)
//     })
// }


// function retryApplyRules() {
//     applyRules()
//     setTimeout(() => {
//         retryApplyRules()
//     }, 2000)
// }

// retryApplyRules()


// Метод 2
const style = document.createElement('style');
style.textContent = `
  .direct {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }
`;
document.documentElement.appendChild(style);