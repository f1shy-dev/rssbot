import { parse } from "parse5";
import { findElement } from "@web/parse5-utils";

export const getGPTMessagesFromReply = (replyMessage) => {
    // returns an array of messages or []
    // console.log("reply", replyMessage)
    try {
        if (replyMessage.id) {
            let body = replyMessage.body.content
            let parsed = parse(body)
            let element = findElement(parsed, (node) => node.tagName === 'p' && node.attrs[0].name === 'itemprop' && node.attrs[0].value.startsWith('rssbot-cpt-encoding'))
            // console.log(element)
            let b64_data = element.attrs[0].value.split('####')[1]
            let data = atob(b64_data)
            let json = JSON.parse(decodeURIComponent(data))
            // console.log("gpt_data", json)
            if (json.chat_history && json.user_id) {
                return { replyMsgs: json.chat_history, userId: json.user_id }
            }
        }
        return { replyMsgs: [], userId: null }
    }
    catch (error) {
        return { replyMsgs: [], userId: null }
    }

}