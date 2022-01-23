import { errorData, ignoreData, simpleErrorData } from '../util/botData'
import { redditCommand } from './reddit'
export const commandHandler = query => {
    const { m } = query

    if (m === '' || m === undefined)
        return errorData(new Error(`CommandMissing`))

    if (!m.startsWith('!')) return ignoreData()

    switch (m.split(' ')[0]) {
        case '!reddit':
            return redditCommand(m)
        default:
            return simpleErrorData(
                `<strong>Error: Command ${
                    m.split(' ')[0]
                } not found!</strong><br><br>Valid commands: <strong>!reddit</strong>`
            )
    }
}
