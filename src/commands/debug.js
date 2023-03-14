import { textData } from '../util/botData'
import { getGPTMessagesFromReply } from '../util/replyParser'

export const debug = async ({ msg, args, user, config, msgData, mentionToken, replyMessage }) => {

    const { replyMsgs, userId } = getGPTMessagesFromReply(replyMessage)

    return textData(
        `<p><b>Debug Data</b></p>
        <ul>
            <li><b>${Object.keys(config.commands).length}</b> commands loaded</li>
            <li><b>bot prefix:</b> ${config.prefix}</li>
            <li><b>user info:</b> ${JSON.stringify(user)}</li>
            <li><b>msg:</b> ${msg}</li>
            ${replyMsgs.length > 0 ? `<li><b>cpt messages:</b> ${JSON.stringify(replyMsgs)}</li>` : ''}
            ${userId ? `<li><b>cpt user id:</b> ${userId}</li>` : ''}
        </ul>`)
}