import { Router } from 'itty-router'
import { commandHandler as commandHandlerOld } from './old_engine/util/handler.js'
import { commandHandler as commandHandlerNew } from './util/handler_v2.js'
const router = Router()

const config = {
    prefix: '!',
}

router.get('/rssbot/', async ({ query }) => {
    // if (query.m && query.m.startsWith('/')) return await commandHandlerNew(query, { prefix: "/" })
    return commandHandlerOld(query, config)

})

router.post('/bot_http/', async (res) => await commandHandlerNew(res, { prefix: "/" }))
router.all('*', () => new Response('hello world!', { status: 404 }))

addEventListener('fetch', e => e.respondWith(router.handle(e.request)))
