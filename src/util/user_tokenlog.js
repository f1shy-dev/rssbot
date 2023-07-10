export const eventDB = {
    gpt: 'g',
    clarity: 'c',
    '16k': '16k',
    '4k': '4k',
}

export const logTokenEvent = async (
    userId,
    userName,
    promptTokens,
    completionTokens,
    eventTypes
) => {
    const event_db = (await MAINKV.get(`tokenlog`, { type: 'json' })) || {}
    if (!event_db.userMap) event_db.userMap = {}
    if (!event_db.userMap[userId]) event_db.userMap[userId] = userName
    if (!event_db.events) event_db.events = {}
    if (!event_db.events[userId]) event_db.events[userId] = {}

    event_db.events[userId][Date.now()] = {
        et: eventTypes.map(e => eventDB[e] || e),
        pt: promptTokens,
        ct: completionTokens,
    }
    console.log(`[tkl write_event]`, Date.now(), new Date().toISOString(), {
        et: eventTypes.map(e => eventDB[e] || e),
        pt: promptTokens,
        ct: completionTokens,
    })
    await MAINKV.put(`tokenlog`, JSON.stringify(event_db))
}
