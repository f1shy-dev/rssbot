export const stringify = obj => {
    if (typeof obj === 'string') return obj
    if (typeof obj === 'object') return JSON.stringify(obj, null, 2)
    if (obj.toString) return obj.toString()
    return obj
}
