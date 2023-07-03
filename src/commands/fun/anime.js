import { cardData, errorData, textData } from '../../util/botData'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { baseCard } from '../../util/adaptivecard'
import { schedule } from './anime/schedule'

export const anime = async ({
    msg,
    args,
    mArgs,
    user,
    config,
    replyMessage,
}) => {
    const subcommand = mArgs._[0] || mArgs.s || 'help'

    const subcommands = [
        [
            schedule,
            ['schedule', 's'],
            'See the airing schedule for today (or tommorow).',
        ],
        [
            () => {
                return textData(
                    `**Anime commands**\n\n${subcommands
                        .filter(i => i[1][0] !== 'help')
                        .map(
                            cmd =>
                                `<code>${config.prefix}anime ${cmd[1][0]}</code> - ${cmd[2]}`
                        )}`
                )
            },
            ['help', 'h'],
            'Get help with this commmand',
        ],
    ]

    const find = subcommands.find(i => i[1].includes(subcommand))

    if (!find)
        return errorData(
            `Invalid subcommand. Use <code>${config.prefix}anime help</code> to get help.`
        )

    return await find[0]({
        msg,
        args,
        mArgs,
        user,
        config,
        replyMessage,
    })
}
