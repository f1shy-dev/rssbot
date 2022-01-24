import { ping } from './ping'
import { reddit } from './reddit'
import { help } from './help'

export default { help, ping, reddit, debug }

export const descMap = {
    help: 'shows this help menu',
    ping: '🏓 pong!',
    reddit: 'view posts from reddit',
    debug: 'shows debug statistics',
}
