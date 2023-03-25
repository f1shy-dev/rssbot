import { errorData, ignoreData, simpleErrorData } from './botData'
import commands from '../commands'
import minimist from 'minimist'

const handle = async (res, config) => {
    const { msgData, mentionToken, replyMessage } = await res.json()
    // console.log(JSON.stringify({ msgData, mentionToken, replyMessage }, null, 2))
    const msg = msgData.body.plainTextContent
    console.log("body", JSON.stringify(msgData.body, null, 2))
    const user = msgData.from.user

    if (!msgData.from.user || !msgData.from.user.id || msgData.from.user.id === "") return ignoreData()
    if (msg === '') return ignoreData()

    if (msg === undefined)
        return errorData(new Error(`CommandMissing`))

    const cmdRaw = msg
        .trim()
        .split('\n')[0]
        .split(' ')[0]

    if (!cmdRaw.startsWith(config.prefix)) return ignoreData()
    const cmd = cmdRaw.substring(config.prefix.length)

    if (commands[cmd])
        // return commands[cmd](msg, msg.split(' ').slice(1), user, {
        //     ...config,
        //     commands,
        // }, cmdRaw)
        return commands[cmd]({
            msg,
            args: msg.split(' ').slice(1),
            mArgs: minimist(msg.split(' ').slice(1)),
            user,
            config: {
                ...config,
                commands,
            },
            msgData,
            mentionToken,
            replyMessage,
        })

    return simpleErrorData(
        `The command <b>${cmd}</b> doesn't exist!<br><br>Run <b>${config.prefix}help</b> for a list of commands.`
    )
}

export const commandHandler = async (res, config) => {
    // try catch handle()
    try {
        const response = await handle(res, config)
        // copy response and log the body being sewnt
        // const responseCopy = response.clone()
        // if (responseCopyX.body) {
        //     console.log(await responseCopy.json())
        // }

        return response
    }
    catch (e) {
        console.log(e)
        return errorData(e)
    }
}

