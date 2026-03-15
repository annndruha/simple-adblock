function varDefined(v) {
    return v !== 'undefined' && v !== 'null' && v !== null && v !== undefined && v !== ''
}

function isNumeric(v) {
    return /^\d+$/.test(v)
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}