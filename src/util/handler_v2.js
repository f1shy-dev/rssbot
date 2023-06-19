import { errorData, ignoreData, simpleErrorData } from './botData'
import { commandMap } from '../commands'
import minimist from 'minimist'

const handle = async (res, evt, config) => {
    const { msgData, mentionToken, replyMessage } = await res.json()
    // console.log(JSON.stringify({ msgData, mentionToken, replyMessage }, null, 2))
    // console.log('body', JSON.stringify(msgData.body, null, 2))

    if (
        !msgData ||
        !msgData.body ||
        !msgData.from ||
        !msgData.from.user ||
        !msgData.from.user.id ||
        msgData.from.user.id === '' ||
        !msgData.body.plainTextContent
    )
        return ignoreData()

    const msg = msgData.body.plainTextContent
    const user = msgData.from.user
    if (msg.trim() === '') return ignoreData()
    if (msg === undefined) return errorData(new Error(`CommandMissing`))

    const cmdRaw = msg
        .trim()
        .split('\n')[0]
        .split(' ')[0]
        .toLowerCase()
        .trim()

    if (!cmdRaw.startsWith(config.prefix)) return ignoreData()
    const mapped = Object.values(commandMap)
        .flat()
        .find(c => c.aliases.includes(cmdRaw.substring(config.prefix.length)))

    if (!mapped)
        return simpleErrorData(
            `The command <b>${cmdRaw}</b> doesn't exist!<br><br>Run <b>${config.prefix}help</b> for a list of commands.`
        )
    if (mapped.userids && !mapped.userids.includes(user.id))
        return simpleErrorData(`You don't have permission to use this command!`)

    return mapped.run({
        msg,
        args: msg.split(' ').slice(1),
        mArgs: minimist(msg.split(' ').slice(1)),
        user,
        config,
        msgData,
        mentionToken,
        replyMessage,
        event: evt,
    })
}

export const commandHandler = async (res, evt, config) => {
    // try catch handle()
    try {
        const response = await handle(res, evt, config)
        // copy response and log the body being sewnt
        // const responseCopy = response.clone()
        // if (responseCopyX.body) {
        //     console.log(await responseCopy.json())
        // }

        return response
    } catch (e) {
        console.log(e)
        return errorData(e)
    }
}
