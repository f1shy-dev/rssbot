import { Router } from 'itty-router'
import { commandHandler } from './util/handler.js'
const router = Router()

const config = {
    prefix: '!',
}

router.get('/rssbot/', ({ query }) => commandHandler(query, config))
router.all('*', () => new Response('hello world!', { status: 404 }))

addEventListener('fetch', e => e.respondWith(router.handle(e.request)))
