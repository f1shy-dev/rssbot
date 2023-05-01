import { debug } from './debug'
import { math } from './math'
import { gpt } from './gpt'
import { help } from './help'
import { gptusage } from './gptusage'
import { kb } from './kb'
export default { debug, math, gpt, help, gptusage, kb }

export const commandDescriptions = {
    debug: 'shows debug statistics',
    math: 'testing for rendering math equations',
    gpt: 'generate text using i-wonder-what',
    help: 'shows this help menu',
    gptusage: 'shows openai account usage',
    kb: 'get link to any kerboodle book without logging in',
}
