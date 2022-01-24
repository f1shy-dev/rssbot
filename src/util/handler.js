import { errorData, ignoreData, simpleErrorData } from './botData'
import commands from '../commands'

export const commandHandler = (query, config) => {
    const msg = query.m
    if (msg === '' || msg === undefined)
        return errorData(new Error(`CommandMissing`))

    const cmdRaw = msg.trim().split(' ')[0]
    if (!cmdRaw.startsWith(config.prefix)) return ignoreData()
    const cmd = cmdRaw.substring(config.prefix.length)

    if (commands[cmd])
        return commands[cmd](msg, msg.split(' ').slice(1), {
            ...config,
            commands,
        })

    return simpleErrorData(
        `The command <b>${cmd}</b> doesn't exist!<br><br>Run <b>!help</b> for a list of commands.`
    )
}
