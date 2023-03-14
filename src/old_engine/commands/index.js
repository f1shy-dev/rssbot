import { ping } from './ping'
import { reddit } from './reddit'
import { help } from './help'
import { debug } from './debug'
import { random } from './random'
import { dcard } from './dcard'
import { gpt } from './gpt'
import { gptusage } from './gptusage'
import { randomcase } from './randomcase'
export default { help, ping, reddit, debug, random, dcard, gpt, gptusage, randomcase }

export const descMap = {
    help: 'shows this help menu',
    ping: '🏓 pong!',
    reddit: 'view posts from reddit (broken)',
    debug: 'shows debug statistics',
    random: 'generates a random number',
    dcard: 'shows a demo card element',
    gpt: 'generates text using i-wonder-what',
    gptusage: 'shows credits/balence',
    randomcase: 'mAkeS tExT lOoK LiKe ThIs',
}
