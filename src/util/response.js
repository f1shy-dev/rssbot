export const FakeRSSResponse = jsonData =>
    new Response(
        `<rss version="2.0"><channel><title>fakeRSS</title><description>fakeRSS</description><language>en</language><item><title>json</title><link>https://fakeRSS.labs/json</link><description>${JSON.stringify(
            jsonData
        )}</description><pubDate>Sun, 23 Jan 2022 17:50:24 -0000</pubDate></item></channel></rss>`,
        {
            headers: {
                'Content-Type': 'application/xml',
            },
        }
    )

export const JSONResponse = data =>
    new Response(JSON.stringify(data, null, 2), {
        headers: {
            'Content-Type': 'application/json',
        },
    })
