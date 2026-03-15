function set_rule(domain, selector, property, value){
    chrome.storage.local.get(null, (result)=> {
        console.log('result', result, 'domain', domain)
        let site_rules = result[domain]
        let n_rules = 0
        console.log('site_rules', site_rules)
        if (!varDefined(site_rules)){
            site_rules = {}
            site_rules[1] = {'selector':selector, 'property': property, 'value': value}
        }
        else {
            n_rules = Object.keys(site_rules).length
            site_rules[n_rules+1] = {'selector':selector, 'property': property, 'value': value}
        }

        chrome.storage.local.set({[domain]: site_rules}, () => {
            chrome.storage.local.get(null, (res) => {
                addRuleslist(domain)
                console.log("Storage value set:", res[domain])})
        })
    })
}

function remove_rule(){
    chrome.tabs.query({active: true}, function(tabs){
        let url = new URL(tabs[0].url)
        let domain = url.hostname
        let ruleid = 3 // TODO: add buttons

        chrome.storage.local.get(null, (result)=> { // TODO: Optimize call for domain, not for null
            let site_rules = result[domain]
            let n_rules = 0
            if (varDefined(site_rules)){
                n_rules = Object.keys(site_rules).length

                // if (n_rules===1) {
                //     site_rules = {}
                // }
                // else {
                //     for (let i=ruleid; i<n_rules; i++){
                //         site_rules[ruleid] = site_rules[ruleid+1]
                //     }
                //
                // }
                //
                delete site_rules[n_rules]
                chrome.storage.local.set({[domain]: site_rules}, () => {
                    chrome.storage.local.get(null, (res) => {
                        addRuleslist(domain)
                        console.log("Storage value set:", res[domain])})
                })
            }
        })
    })
}

function updateButton() {
    let selector =  document.getElementById('selector').value
    let property =  document.getElementById('ruleproperty').value
    let value =  document.getElementById('rulevalue').value

    // Set rule in storage
    chrome.tabs.query({active: true}, function(tabs){
        let url = new URL(tabs[0].url)
        let domain = url.hostname
        set_rule(domain, selector, property, value)
    })

    // TODO: get edit access from main to active page
    // Apply rule
    // chrome.tabs.query({active: true}, function(tabs){
    //
    //     changeContent(rules)
    //     set_rule(tabs[0].url, selector, property, value)
    // })
}

const addrule_button = document.querySelector('#apply');
addrule_button.addEventListener('click', updateButton);


const remrule_button = document.querySelector('#remove');
remrule_button.addEventListener('click', remove_rule);


// Add rules list when open popup
chrome.tabs.query({active: true}, function(tabs){
    let url = new URL(tabs[0].url)
    let domain = url.hostname
    let domain_name = document.querySelector('#domain_name')
    domain_name.innerHTML = domain
    addRuleslist(url.hostname)
})

console.log('Content changer main script loaded.')