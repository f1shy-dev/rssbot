import { Router } from 'itty-router'
// import { commandHandler as commandHandlerOld } from './old_engine/util/handler.js'
import { commandHandler as commandHandlerNew } from './util/handler_v2.js'
const router = Router()
import { getSourcesFromDDG, getTextFromURL } from './util/sourceParser.js'
import { stringify } from './util/json_util.js'
import { browserHeaders } from './util/browserHeaders.js'

// const config = {
//     prefix: '!',
// }

// router.get('/rssbot/', async ({ query }) => {
//     // if (query.m && query.m.startsWith('/')) return await commandHandlerNew(query, { prefix: "/" })
//     return commandHandlerOld(query, config)

// })

// router.post('/bot_http/', async (res) => await commandHandlerNew(res, { prefix: "/" }))

router

    .post(
        '/bot_http_fast/',
        async (res, evt) => await commandHandlerNew(res, evt, { prefix: '/' })
    )
    .get('/res_info', async (res, evt) => {
        return new Response(
            stringify({
                headers: Object.fromEntries(res.headers.entries()),
                url: res.url,
                host: res.url.match(/https?:\/\/([^\/]+)/)[1],
                method: res.method,
                body: await res.text(),
            })
        )
    })

    .get('/proxy', async (res, evt) => {
        const url = new URL(res.url).searchParams.get('url')
        if (!url)
            return new Response(
                stringify({ status: 400, body: 'No url provided!' })
            )

        const full = await getTextFromURL(url)
        if (!full)
            return new Response(
                stringify({ status: 400, body: 'Error getting source!' })
            )

        return new Response(full, {
            headers: {
                'content-type': 'text/html; charset=UTF-8',
                cache: 'no-cache',
            },
        })
    })

    .get('/google_proxy', async (res, evt) => {
        const query = new URL(res.url).searchParams.get('q')
        if (!query)
            return new Response(
                stringify({ status: 400, body: 'No url provided!' })
            )
        let sources = await getSourcesFromDDG(query)
        if (!sources)
            return new Response(
                stringify({ status: 400, body: 'Error getting source!' })
            )

        sources = sources.filter(
            s =>
                s.url &&
                [
                    //blacklist
                    'google',
                    'facebook',
                    'instagram',
                    'youtube',
                    'tiktok',
                ].every(b => !s.url.includes(b))
        )

        //seperate blacklist for sites to not get full text from
        const noFullText = [
            'linkedin',
            '.pdf',
            '.doc',
            '.docx',
            '.ppt',
            '.pptx',
        ]

        let unblocked = sources.filter(
            s => s.url && noFullText.every(b => !s.url.includes(b))
        )
        console.log('unblocked', sources)

        const promises = unblocked.slice(0, 4).map(async s => {
            const full = await Promise.race([
                getTextFromURL(s.url),

                new Promise((r, _) => setTimeout(() => r(null), 800)),
            ])
            if (!full) return s
            return { ...s, full }
        })

        sources = [
            ...(await Promise.all(promises)),
            ...(sources
                .filter(s => !promises.some(u => u.url === s.url))
                .slice(0, 4) || []),
        ]

        return new Response(JSON.stringify(sources, null, 2), {
            headers: {
                'content-type': 'text/json; charset=UTF-8',
                cache: 'no-cache',
            },
        })
    })
    .all('*', () => new Response('hello world!', { status: 404 }))

addEventListener('fetch', e => e.respondWith(router.handle(e.request, e)))
