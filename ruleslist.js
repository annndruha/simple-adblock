function ruleToText(rule) {
    let selector = rule['selector']
    let property = rule['property']
    let value = rule['value']
    return selector.toString() +'\t' + property.toString() + '\t' + value.toString()
}

function addRule(i, rule) {
    let rules_list = document.querySelector('#rules_list')
    let item = document.createElement('div')
    item.innerHTML = 'Rule ' + i.toString() + ':   ' + ruleToText(rule)
    rules_list.appendChild(item)
}

function _addRuleslist(rules) {
    let n_rules = Object.keys(rules).length
    for (let i = 1; i < n_rules+1; i++) {
        let rule = rules[i]
        addRule(i, rule)
    }
}

function _removeRuleslist(){
    let rules_list = document.querySelector('#rules_list')
    rules_list.innerHTML = ''
}

function addRuleslist(domain) {
    chrome.storage.local.get(null, (res)=> {
        let rules = res[domain]
        if (varDefined(rules)){
            _removeRuleslist()
            _addRuleslist(rules)
        }
    })
}