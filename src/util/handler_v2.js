import { errorData, ignoreData, simpleErrorData } from './botData'
import { commandMap } from '../commands'
import { adaptiveMap } from '../adaptives'
import minimist from 'minimist'

const adaptiveHandler = async (data, evt, config) => {
    if (!data.adaptiveData) return ignoreData()
    const { teamsFlowRunContext, cardOutputs } = data.adaptiveData

    if (
        !cardOutputs ||
        !cardOutputs['card_id'] ||
        !teamsFlowRunContext ||
        !teamsFlowRunContext.MessagePayload ||
        !teamsFlowRunContext.MessagePayload.From ||
        !teamsFlowRunContext.MessagePayload.From.User
    )
        return ignoreData()

    const user = Object.fromEntries(
        Object.entries(
            teamsFlowRunContext.MessagePayload.From.User
        ).map(([k, v]) => [k.toLowerCase(), v])
    )

    const run = adaptiveMap[cardOutputs['card_id']]
    if (!run) return ignoreData()
    return run({ user, outputs: cardOutputs })
}

const handle = async (res, evt, config) => {
    const data = await res.json()
    if (!data.type) return ignoreData()
    if (data.type === 'adaptive_response')
        return adaptiveHandler(data, evt, config)
    if (!data.type === 'message') return ignoreData()

    const { msgData, mentionToken, replyMessage } = data
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
        .replace(/&nbsp;/g, ' ')
        .trim()
        .split('\n')[0]
        .split(' ')[0]
        .toLowerCase()
        .trim()

    if (!cmdRaw.startsWith(config.prefix)) return ignoreData()
    const mapped = Object.values(commandMap)
        .flat()
        .find(c =>
            c.aliases.includes(cmdRaw.trim().substring(config.prefix.length))
        )

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
        httpRes: res,
        cmdData: mapped,
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
