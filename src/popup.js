function split_value(value) {
    return value.split('||||abs_rand_string||||', 2)
}

// Безопасно достаёт hostname из вкладки.
// tab.url может быть undefined/пустым (страница ещё грузится — тогда есть pendingUrl,
// нет прав, служебная страница) или содержать символы, которые new URL() не принимает.
function get_tab_hostname(tab) {
    const raw = tab && (tab.url || tab.pendingUrl)
    if (!raw) return ''

    try {
        return new URL(raw).hostname
    } catch (e) {
        console.warn('Не удалось разобрать URL через new URL():', raw, e)
    }

    // Запасной вариант: вытащить хост регуляркой
    const m = String(raw).trim().match(/^[a-z][a-z0-9+.\-]*:\/\/(?:[^@\/?#]*@)?([^\/?#:]+)/i)
    if (!m) return ''
    let host = m[1]
    try { host = decodeURIComponent(host) } catch (e) { /* оставляем как есть */ }

    // Приводим кириллический домен к punycode (как location.hostname в content-скрипте)
    try {
        return new URL('http://' + host).hostname
    } catch (e) {
        return host.toLowerCase()
    }
}

function get_active_tab(callback) {
    // currentWindow: true — иначе tabs[0] может оказаться вкладкой из другого окна
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        callback(tabs && tabs[0])
    })
}

function join_value(domain, selector) {
    return domain + '||||abs_rand_string||||' + selector
}

function reset_and_close_edit_form() {
    document.getElementById('edit_id').innerHTML = ''
    document.getElementById('domain').value = ''
    document.getElementById('new-manual-selector').value = ''
    document.getElementById('new-value').value = ''
    window.edit_dialog.close()
}

function saveToFile() {
    chrome.storage.sync.get(null, (res) => {
        let now_str = new Date().toISOString()
        $('<a></a>', {
            'download': 'simple-adblock-' + now_str.split('T')[0] + '.json',
            'href': 'data:application/json,' + encodeURIComponent(JSON.stringify(res, null, '\t'))
        }).appendTo('body').click(() => {
            $(this).remove()
        })[0].click()
        console.log('Save rules to file')
    })
}

function load_notes() {
    get_active_tab((tab) => {
        const current_domain = get_tab_hostname(tab)

        document.getElementById('current_domain').innerText = current_domain
        chrome.storage.sync.get(null, (res) => {
            let header = document.getElementById('header')
            header.innerHTML = ''
            for (let [key, value] of Object.entries(res)) {
                const [domain, selector] = split_value(value)

                if (current_domain == domain) {
                    const element = `<div id="${key}" class="note">
                            <div class="half-left">
                                <span class="domain">${selector}</span>
                                
                            </div>
                            <div class="half-right">
                                <img src="images/edit.svg" class="edit_note_button"></img>
                                <img src="images/delete.svg" class="delete_note_button"></img>
                            </div>
                        </div>`
                    header.innerHTML = header.innerHTML + element
                }
            }
            addNodeListeners()
        })
    })
}

function addNodeListeners() {
    $('.delete_note_button').on('click', function (e) {
        e.stopPropagation()
        e.preventDefault()
        let key = e.target.parentElement.parentElement.id
        console.log('delete key: ', key)
        chrome.storage.sync.remove([key], () => {
            chrome.storage.sync.get(null, (res) => {
                console.log(res)
            })
        })
        document.getElementById(key).remove()
    })

    $('.edit_note_button').on('click', function (e) {
        e.stopPropagation()
        e.preventDefault()
        let key = e.target.parentElement.parentElement.id
        console.log('Open edit: ', key)
        window.edit_dialog.showModal()

        chrome.storage.sync.get([key], (res) => {
            const [domain, selector] = split_value(res[key])
            document.getElementById('edit_id').innerHTML = key
            document.getElementById('domain').value = domain
            document.getElementById('new-value').value = selector
        })
    })
}

document.addEventListener('DOMContentLoaded', () => {
    $('#edit_discard').on('click', function (e) {
        const key = document.getElementById('edit_id').innerHTML
        console.log('Discard edit: ', key)
        e.stopPropagation()
        e.preventDefault()
        reset_and_close_edit_form()
    })

    $('#edit_apply').on('click', function (e) {
        e.stopPropagation()
        e.preventDefault()
        const key = document.getElementById('edit_id').innerHTML

        const value = join_value(document.getElementById('domain').value, document.getElementById('new-value').value)
        console.log('Apply edit: ', key, value)

        let json = {}
        json[key] = value
        chrome.storage.sync.set(json, (res) => {
            console.log('Edit saved', res)
            reset_and_close_edit_form()
            load_notes()
        })
    })

    $('#new_rule_apply').on('click', function (e) {
        e.stopPropagation()
        e.preventDefault()

        get_active_tab((tab) => {
            console.log('URL:', tab && (tab.url || tab.pendingUrl))
            let idx = new Date().getTime().toString(36)
            const domain = get_tab_hostname(tab)
            if (!domain) {
                console.warn('Не удалось определить домен текущей вкладки, правило не сохранено')
                return
            }

            const value = join_value(domain, document.getElementById('new-manual-selector').value)
            console.log('Apply edit: ', idx, value)

            let json = {}
            json[idx] = value
            chrome.storage.sync.set(json, (res) => {
                console.log('Edit saved', res)
                reset_and_close_edit_form()
                load_notes()
            })
        })
    })

    $('#delete_all').on('click', function (e) {
        e.stopPropagation()
        e.preventDefault()
        chrome.storage.sync.clear(() => {
            load_notes()
        })
    })

    $('#backup_rules').on('click', function (e) {
        e.stopPropagation()
        e.preventDefault()
        saveToFile()
    })

    load_notes()
})
