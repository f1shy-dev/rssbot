export const gql = async (query, variables) => {
    const res = await fetch('https://graphql.anilist.co', {
        body: JSON.stringify({
            query,
            variables,
        }),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    })

    if (!res.ok) return new Error(`AniList API error - ${res.status}`)
    const data = await res.json()
    if (data.errors || data.data == null)
        return new Error(
            `AniList API error - ${
                data.errors.length
                    ? data.errors[0].message
                    : data.errors.message
            }`
        )
    return data.data
}
