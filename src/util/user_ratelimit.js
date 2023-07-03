export const getUserLastUsed = async (userId, rateLimitID) => {
    const usage_db =
        (await MAINKV.get(`ratelimit:${rateLimitID}`, { type: 'json' })) || {}
    if (usage_db[userId]) return new Date(usage_db[userId])
    return null
}

export const setUserLastUsed = async (userId, rateLimitID) => {
    const usage_db =
        (await MAINKV.get(`ratelimit:${rateLimitID}`, { type: 'json' })) || {}
    usage_db[userId] = new Date()
    await MAINKV.put(`ratelimit:${rateLimitID}`, JSON.stringify(usage_db))
}
