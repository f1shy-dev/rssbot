import { debug } from './debug'
import { math } from './math'
import { gpt } from './gpt'
import { help } from './help'
import { kb } from './kb'
import { bard } from './bard'
import { clarity } from './clarity'

export const commandMap = {
    'AI Tools': [
        {
            run: gpt,
            aliases: ['gpt', 'ai', 'got', 'gptee'],
            description: 'generate text using :)',
        },
        {
            run: clarity,
            aliases: ['clarity', 'sgpt', 'sai'],
            description: 'generate text using :) and the power of the internet',
        },
        {
            run: bard,
            aliases: ['bard'],
            description: 'bard',
            userids: [
                '1e2b0ed7-dd66-4474-bfb2-5cb694e64343',
                '3e3f009d-4caa-4994-abda-fe1cdf02824d',
            ],
        },
    ],
    Utilities: [
        {
            run: help,
            aliases: ['help', 'h'],
            description: 'shows this help menu',
        },
        {
            run: kb,
            aliases: ['kb', 'kerboodle'],
            description: 'get link to any kerboodle book without logging in',
        },
        {
            run: math,
            aliases: ['math', 'rendermath'],
            description: 'testing for rendering math equations',
        },
        {
            run: debug,
            aliases: ['debug'],
            description: 'shows debug statistics',
        },
    ],
}
