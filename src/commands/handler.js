import { errorData, ignoreData, simpleErrorData } from '../util/botData'
import { redditCommand } from './reddit'
import { helpCommand } from './help'
import { pingCommand } from './ping'

export const commandHandler = query => {
    const msg = query.m
    if (msg === '' || msg === undefined)
        return errorData(new Error(`CommandMissing`))

    const cmd = msg.split(' ')[0]
    if (!cmd.startsWith('!')) return ignoreData()
    const c = name => cmd == `!${name}`

    if (c('reddit')) return redditCommand(msg)
    if (c('help')) return helpCommand(msg)
    if (c('ping')) return pingCommand(msg)

    return simpleErrorData(
        `The command <b>${
            m.split(' ')[0]
        }</b> doesn't exist!<br><br>Run <b>!help</b> for a list of commands.`
    )
}
