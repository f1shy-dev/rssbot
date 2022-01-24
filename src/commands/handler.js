import { errorData, ignoreData, simpleErrorData } from '../util/botData'
import { redditCommand } from './reddit'
import { helpCommand } from './help'

export const commandHandler = query => {
    const { m } = query

    if (m === '' || m === undefined)
        return errorData(new Error(`CommandMissing`))

    if (!m.startsWith('!')) return ignoreData()

    switch (m.split(' ')[0]) {
        case '!reddit':
            return redditCommand(m)
        case '!help':
            return helpCommand(m)    
        default:
            return simpleErrorData(
                `<strong>Error: Command ${
                    m.split(' ')[0]
                } not found!</strong><br><br>Run <strong>!help</strong> for a list of commands.`
            )
    }
}
