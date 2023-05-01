import { errorData, ignoreData, simpleErrorData } from './botData'
import commands from '../commands'

export const commandHandler = (query, config) => {
    console.log(JSON.parse(decodeURIComponent(atob(query.u || 'e30='))))
    console.log(JSON.parse(decodeURIComponent(atob(query.b || 'e30='))))
    const msg = query.m

    const user = JSON.parse(atob(query.u || 'e30=')) || {}

    if (msg === '' || msg === undefined)
        return errorData(new Error(`CommandMissing`))

    const cmdRaw = msg
        .trim()
        .split('\n')[0]
        .split(' ')[0]
    if (!cmdRaw.startsWith(config.prefix)) return ignoreData()
    const cmd = cmdRaw.substring(config.prefix.length)

    if (commands[cmd])
        return commands[cmd](msg, msg.split(' ').slice(1), user, {
            ...config,
            commands,
        })

    return simpleErrorData(
        `The command <b>${cmd}</b> doesn't exist!<br><br>Run <b>!help</b> for a list of commands.`
    )
}
