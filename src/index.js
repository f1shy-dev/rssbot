import { Router, createCors, error, json, html } from 'itty-router'
import { commandHandler as commandHandlerNew } from './util/handler_v2.js'
const router = Router()
import { getSourcesFromDDG, getTextFromURL } from './util/sourceParser.js'
import jwt from '@tsndr/cloudflare-worker-jwt'
import { checkAuth } from './util/auth.js'
import { browserHeaders } from './util/browserHeaders.js'
const { preflight, corsify } = createCors({
    // origins: ['*', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    // headers: ['Content-Type', 'Authorization', 'X-User-ID'],
})
router
    .all('*', preflight)
    .post('/jwt/:key', async (res, evt) => {
        const authorisedUsers = (await MAINKV.get('USERKEYS')) || USERKEYS
        const userID = res.headers.get('x-user-id')
        let key = res.params.key

        if (!userID || !key || !authorisedUsers.includes(userID))
            return corsify(error(401))
        let jwtKey = atob(key)
        jwtKey =
            jwtKey

                .split('')
                .slice(0, Math.floor(jwtKey.length / 2))
                .reverse()
                .join('') + jwtKey.slice(Math.floor(jwtKey.length / 2))

        jwtKey = decodeURIComponent(atob(jwtKey))
        const random = Number(jwtKey.split('/')[0])
        const dateHash = Number(jwtKey.split('/')[1])
        const clientDate =
            dateHash /
            Number(random.toString().slice(Math.floor(random.length / 2)))

        const serverSig = Math.round((new Date().getTime() * random) / 3.7)
        const computedSig = Math.round((clientDate * random) / 3.7)
        console.log(jwtKey)
        const withinWindow = serverSig / computedSig < 1.0000000001
        if (!withinWindow) return corsify(error(401))
        const token = await jwt.sign(
            {
                userID,
                cd: clientDate,
                key,
                exp: Math.floor(Date.now() / 1000) + 8 * (60 * 60), // Expires: Now + 2h
            },
            JWT_SECRET
        )

        return corsify(json({ token }))
    })
    .post('/v1c_relay/', async (res, evt) => {
        const { valid, userID } = await checkAuth(res)
        if (
            !valid ||
            !((await MAINKV.get('ALLOWED_V1C')) || ALLOWED_V1C)
                .split(',')
                .includes(userID)
        )
            return error(401)

        return corsify(
            await fetch('https://api.openai.com/v1/chat/completions', {
                body: (await res.text()) || '{}',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENAI_KEY}`,
                },
                method: 'POST',
            })
        )
    })

    .post('/bot_http_fast/', async (res, evt) => {
        const { valid, userID } = await checkAuth(res)
        if (!valid) return error(401)
        return await commandHandlerNew(res, evt, userID, { prefix: '/' })
    })
    .post('/bot_prefix-exclaim/', async (res, evt) => {
        const { valid, userID } = await checkAuth(res)
        if (!valid) return error(401)
        return await commandHandlerNew(res, evt, userID, { prefix: '!' })
    })
    .get('/check_auth', async (res, evt) => {
        const { valid, userID } = await checkAuth(res)
        return corsify(json({ valid, userID }))
    })
    .get('/res_info', async (res, evt) =>
        json({
            headers: Object.fromEntries(res.headers.entries()),
            url: res.url,
            host: res.url.match(/https?:\/\/([^\/]+)/)[1],
            method: res.method,
            body: await res.text(),
        })
    )
    .get('/proxy', async (res, evt) => {
        const url = new URL(res.url).searchParams.get('url')
        if (!url) return error(400, { body: 'No url provided!' })

        const full = await getTextFromURL(url)
        if (!full) return error(400, { body: 'Error getting source!' })

        return corsify(html(full))
    })
    .get('/ddg', async (res, evt) => {
        const query = new URL(res.url).searchParams.get('q')
        if (!query) return error(400, { body: 'No query provided!' })
        return corsify(
            html(
                await fetch('https://duckduckgo.com/html/?q=' + query, {
                    headers: browserHeaders(
                        'https://duckduckgo.com/html/?q=' + query
                    ),
                })
            )
        )
    })
    .get('/html_proxy', async (res, evt) => {
        const url = new URL(res.url).searchParams.get('url')
        if (!url) return error(400, { body: 'No url provided!' })
        return corsify(
            html(
                await fetch(url, {
                    headers: browserHeaders(url),
                })
            )
        )
    })
    .all('*', () => error(404, { body: 'hello world!' }))

addEventListener('fetch', e => e.respondWith(router.handle(e.request, e)))
