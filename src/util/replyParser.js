import { parse } from "parse5";
// import { findElement } from "@web/parse5-utils";

function findTargetPElement(node) {
    if (node.tagName === 'p') {
        // Check if the p element has an itemprop attribute with a value that starts with "rssbot-cpt-encoding"
        const itempropAttribute = node.attrs.find(attr => attr.name === 'itemprop');
        if (itempropAttribute && itempropAttribute.value.startsWith('rssbot-cpt-encoding')) {
            return node;
        }
    }

    if (node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++) {
            const childNode = node.childNodes[i];
            const targetPElement = findTargetPElement(childNode);

            if (targetPElement) {
                return targetPElement;
            }
        }
    }

    return null;
}

export const getGPTMessagesFromReply = (replyMessage) => {
    // returns an array of messages or []
    // console.log("reply", replyMessage)
    try {
        if (replyMessage.id) {
            let body = replyMessage.body.content
            let parsed = parse(body)
            // parsed.childNodes
            const targetP = findTargetPElement(parsed);

            // let element = findElement(parsed, (node) => node.tagName === 'p' && node.attrs[0].name === 'itemprop' && node.attrs[0].value.startsWith('rssbot-cpt-encoding'))
            // console.log(element)
            let b64_data = targetP.attrs[0].value.split('####')[1]
            let data = atob(b64_data)
            let json = JSON.parse(decodeURIComponent(data))
            // console.log("gpt_data", json)
            if (json.chat_history && json.user_id) {
                return { replyMsgs: json.chat_history, userId: json.user_id, userName: json.user_name }
            }
        }
        return { replyMsgs: [], userId: null }
    }
    catch (error) {
        return { replyMsgs: [], userId: null }
    }

}