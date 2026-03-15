function split_value(value) {
    return value.split('||||abs_rand_string||||', 2)
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

function load_notes() {
    chrome.tabs.query({ active: true }, (tabs) => {
        const tab = tabs[0]
        const url = new URL(tab.url)
        const current_domain = url.hostname
        
        document.getElementById('current_domain').innerText = current_domain
        chrome.storage.sync.get(null, (res) => {
            let header = document.getElementById('header')
            header.innerHTML = ''
            for (let [key, value] of Object.entries(res)) {
                const [domain, selector] = split_value(value)

                if (current_domain == domain) {
                    const element = `<div id="${key}" class="note">
                            <div class="half-left">
                                <img src="images/copy.svg" class="icon_copy"></img>
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

        chrome.tabs.query({ active: true }, (tabs) => {
            const tab = tabs[0]
            console.log('URL:', tab.url)
            let idx = new Date().getTime().toString(36)
            const url = new URL(tab.url)
            const domain = url.hostname

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

    load_notes()
})
