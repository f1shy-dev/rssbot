import { Router } from 'itty-router'
import { commandHandler } from './commands/handler.js'
const router = Router()

router.get('/rssbot/', ({ query }) => commandHandler(query))
router.all('*', () => new Response('404 not found!', { status: 404 }))

addEventListener('fetch', e => e.respondWith(router.handle(e.request)))
