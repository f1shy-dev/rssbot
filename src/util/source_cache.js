export const cacheSource = async (url, brief, full) => {
    const cleanedURL = url.split('#')[0].split('?')[0]
    console.log(`[source cache] ${cleanedURL}`)

    await MAINKV.put(
        `sourcecache:${cleanedURL}`,
        JSON.stringify({
            brief,
            full,
            url,
        }),
        {
            // 1 week
            expirationTtl: 60 * 60 * 24 * 7,
        }
    )
}

export const findSourceInCache = async url => {
    const cleanedURL = url.split('#')[0].split('?')[0]
    console.log(`[source find] ${cleanedURL}`)
    const cache = await MAINKV.get(`sourcecache:${cleanedURL}`, {
        type: 'json',
    })
    if (!cache) return null
    return cache
}
