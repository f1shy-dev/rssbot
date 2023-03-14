import { textData } from '../util/botData'
import { renderMath } from '../util/renderMath';
import { getGPTMessagesFromReply } from '../util/replyParser';

export const gpt = async ({ msg, args, user, config, replyMessage }) => {
    const { replyMsgs, userId } = getGPTMessagesFromReply(replyMessage)

    let messages = [
        ...replyMsgs,
        {
            "role": "user",
            "content": args.join(' ')
        }
    ];
    if (replyMsgs.length == 0) {
        messages.push({
            "role": "user",
            "content": "You have some special formatting options. If you want to output any maths or mathematics or math symbols, you should use a LaTeX format, inside 3 curly brackets like this {{{<latex>}}}, for example: you would write x squared or x^2 as: {{{x^2}}}. Please do this for any maths conversations, in place of using normal quotes around letters, even if it is a small term such as x^2."
        })
    }
    if (replyMsgs.length > 0 && userId && user.id && userId !== user.id) {
        return textData(`<b>⛔️ Warning</b><br>It looks like you are trying to reply to somebody else's conversation, which is not allowed. If you are trying to start a new conversation, please do not reply to any messages.`)
    }


    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
            "model": "gpt-3.5-turbo",
            "messages": messages,
        }),
    });

    try {
        const data = await res.json();
        if (!res.ok) {
            let err = new Error(res.statusText);
            err.data = data;
            throw err;
        }
        const text = data.choices[0].message.content.trim();
        messages.push({
            "role": "assistant",
            "content": text
        })

        //<span style=\"font-size:xx-small\">You replied to a message, so you are in a conversation with 7 messages. You used: 372 tokens.</span>
        let sendFooter = false
        let footer = `<br><div style="font-size:x-small">`
        if (replyMsgs.length > 0) {
            footer += `You replied to a message, so you are in a conversation with ${messages.length - 1} messages.`
            sendFooter = true
        }

        if (data.usage.total_tokens > 2400 && data.usage.total_tokens < 4096) {
            footer += ` 🟠 Warning: ${replyMsgs.length > 0 ? "You have " : "In this request, you "}used ${data.usage.total_tokens} tokens of the 4096 token limit.`
            sendFooter = true
        }

        if (data.usage.total_tokens > 4095) {
            footer += ` <b>🚨 Error: ${replyMsgs.length > 0 ? "You have " : "In this request, you "}gone over the 4096 token limit</b>, and you may have been cut off.${replyMsgs.length > 0 ? " You may want to try again without replying to a message." : "You may want to shorten your prompt."}`
            sendFooter = true
        }

        if (sendFooter) footer += "</div>"

        //between the text and footer as the <div> acts as new line on ios renderer
        return textData(`<p itemprop="rssbot-cpt-encoding####${btoa(encodeURIComponent(JSON.stringify({ chat_history: messages, user_id: user.id || "no-id-found" })))}">${await renderMath(text)}</p>${sendFooter ? footer : ''}`);
    } catch (error) {
        if (error.data && error.data.error) {
            if (error.data.error.code && error.data.error.code === "context_length_exceeded") {
                return textData(`<b>⛔️ Error</b><br>You have gone over the 4096 token limit. ${replyMsgs.length > 0 ? "You may want to try again without replying to a message." : "You may want to shorten your prompt."}`)
            }
            if (error.data.error.message) {
                throw new Error(error.data.error.message)
            }
        }
        throw new Error(error.message)
    }
}
