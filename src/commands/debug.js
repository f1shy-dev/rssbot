import { textData } from '../util/botData'
import { getGPTMessagesFromReply } from '../util/replyParser'

export const debug = async ({ msg, args, user, config, msgData, mentionToken, replyMessage }) => {

    const { replyMsgs, userId } = getGPTMessagesFromReply(replyMessage)

    return textData(
        `<p><b>Debug Data</b></p>
        <ul style="font-size:x-small">
            <li><b>${Object.keys(config.commands).length}</b> commands loaded</li>
            <li><b>bot prefix:</b> ${config.prefix}</li>
            <li><b>msgData:</b> ${JSON.stringify(msgData)}</li>
            <li><b>reply message data:</b> ${JSON.stringify(replyMessage)}</li>
            <li><b>msg:</b> ${msg}</li>
            <li><b>html content:</b> ${JSON.stringify(msgData.body.content || "")}</li>
            <li><b>html content escaped:</b> ${JSON.stringify(msgData.body.content ? msgData.body.content.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "[no content]")}</li>
            ${replyMsgs.length > 0 ? `<li><b>cpt messages:</b> ${JSON.stringify(replyMsgs)}</li>` : ''}
            ${userId ? `<li><b>cpt user id:</b> ${userId}</li>` : ''}
        </ul>`)
}

/*

            */