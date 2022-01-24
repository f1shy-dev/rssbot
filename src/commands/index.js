import { ping } from './ping'
import { reddit } from './reddit'
import { help } from './help'
import { debug } from './debug'
import { random } from './random'

export default { help, ping, reddit, debug, random }

export const descMap = {
    help: 'shows this help menu',
    ping: '🏓 pong!',
    reddit: 'view posts from reddit',
    debug: 'shows debug statistics',
    random: 'generates a random number',
}
