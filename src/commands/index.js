import { debug } from './utils/debug'
import { math } from './utils/math'
import { help } from './utils/help'
import { kb } from './utils/kb'

import { gpt } from './ai/gpt'
import { bard } from './ai/bard'
import { clarity } from './ai/clarity'
import { anime } from './fun/anime'
import { aiusage } from './utils/aiusage'

export const commandMap = {
    'AI Tools': [
        {
            run: gpt,
            aliases: ['gpt', 'ai', 'got', 'gptee'],
            description: 'generate text using :)',
            '16k_no_ratelimit': [
                '1e2b0ed7-dd66-4474-bfb2-5cb694e64343',
                '3e3f009d-4caa-4994-abda-fe1cdf02824d',
            ],
        },
        {
            run: clarity,
            aliases: ['clarity', 'cgpt', 'cai'],
            description: 'generate text using :) and the power of the internet',
            '16k_no_ratelimit': [
                '1e2b0ed7-dd66-4474-bfb2-5cb694e64343',
                '3e3f009d-4caa-4994-abda-fe1cdf02824d',
            ],
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
        {
            run: aiusage,
            aliases: ['aiusage'],
            description: 'shows AI usage statistics',
            alldata_userids: [
                '1e2b0ed7-dd66-4474-bfb2-5cb694e64343',
                '3e3f009d-4caa-4994-abda-fe1cdf02824d',
                'b32b5b2b-009e-4177-8811-fb6991e04b0e',
            ],
        },
    ],
    Fun: [
        {
            run: anime,
            aliases: ['anime', 'airing'],
            description: `today's anime schedule`,
        },
    ],
}
