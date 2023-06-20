import { textData } from '../util/botData'
import { renderMath } from '../util/renderMath'
import { getGPTMessagesFromReply } from '../util/replyParser'
import Filter from 'bad-words'

export const gpt = async ({ msg, args, mArgs, user, config, replyMessage }) => {
    const { replyMsgs, userId, userName } = getGPTMessagesFromReply(
        replyMessage
    )

    let messages = [
        ...replyMsgs,
        {
            role: 'user',
            content: mArgs._.join(' '),
        },
    ]
    if (replyMsgs.length == 0) {
        messages.push({
            role: 'user',
            // "content": "You have some special formatting options. If you want to output any maths or mathematics or math symbols, you should use a LaTeX format, inside 3 curly brackets like this {{{<latex>}}}, for example: you would write x squared or x^2 as: {{{x^2}}}. Please do this for any maths conversations, in place of using normal quotes around letters, even if it is a small term such as x^2."
            content: `You have some special formatting options - you can use HTML lists/indented lists, and you can have bold text with <strong>bold</strong> and italics with <i>italics</i>. You can also define large titles using <span style="font-size:x-large;">title text</span> or you can also use px values in place of x-large. Please use the relevant formatting when you are writing your responses.`,
        })
    }
    if (replyMsgs.length > 0 && userId && user.id && userId !== user.id) {
        return textData(
            `<b>⛔️ Warning</b><br>It looks like you are trying to reply to ${
                userName ? userName.split(' ')[0] : 'somebody else'
            }'s conversation. If you are trying to start a new conversation, please do not reply to any messages.`
        )
    }
    // only new lines or empty strings
    if (
        args.length == 0 ||
        args.join(' ').length == 0 ||
        args.join(' ').trim().length == 0
    ) {
        return textData(`<b>Text generation command</b><br>Generate text using an AI model. Run <code>/gpt [what you want to generate - a prompt]</code> to generate something.<br><br>
        <b>Advanced options</b>
        <ul>
            <li><code>-t or --temp or --temperature</code>: set the temperature of the model</li>
            <li><code>-p or --top_p</code>: set the top_p of the model</li>
            <li><code>-p or --presence_penalty</code>: set the presence_penalty of the model</li>
            <li><code>-f or --frequency_penalty</code>: set the frequency_penalty of the model</li>
        </ul>`)
    }

    const temperature = mArgs.temperature || mArgs.temp || mArgs.t || 0.65
    const top_p = mArgs.top_p || 1
    const presence_penalty = mArgs.presence_penalty || mArgs.presence || 0
    const frequency_penalty = mArgs.frequency_penalty || mArgs.frequency || 0
    console.log(
        `[gpt openai] ${
            messages.map(i => i.content).join(' ').length
        } chars - t${temperature} p${top_p} pp${presence_penalty} fp${frequency_penalty} tl4096`
    )

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages,
            temperature,
            top_p,
            presence_penalty,
            frequency_penalty,
        }),
    })

    try {
        const data = await res.json()
        if (!res.ok) {
            let err = new Error(res.statusText)
            err.data = data
            throw err
        }
        const text = data.choices[0].message.content.trim()
        messages.push({
            role: 'assistant',
            content: text,
        })

        //<span style=\"font-size:xx-small\">You replied to a message, so you are in a conversation with 7 messages. You used: 372 tokens.</span>
        let sendFooter = false
        let footer = `<br><div style="font-size:x-small">`
        if (replyMsgs.length > 0) {
            footer += `You replied to a message, so you are in a conversation with ${messages.length} messages.`
            sendFooter = true
        }

        if (data.usage.total_tokens > 2400 && data.usage.total_tokens < 4096) {
            footer += ` 🟠 Warning: ${
                replyMsgs.length > 0 ? 'You have ' : 'In this request, you '
            }used ${data.usage.total_tokens} tokens of the 4096 token limit.`
            sendFooter = true
        }

        if (data.usage.total_tokens > 4095) {
            footer += ` <b>🚨 Error: ${
                replyMsgs.length > 0 ? 'You have ' : 'In this request, you '
            }gone over the 4096 token limit</b>, and you may have been cut off.${
                replyMsgs.length > 0
                    ? ' You may want to try again without replying to a message.'
                    : 'You may want to shorten your prompt.'
            }`
            sendFooter = true
        }

        if (sendFooter) footer += '</div>'

        let filter = new Filter()

        //between the text and footer as the <div> acts as new line on ios renderer
        return textData(
            `<p itemprop="rssbot-cpt-encoding####${btoa(
                encodeURIComponent(
                    JSON.stringify({
                        chat_history: messages,
                        user_id: user.id,
                        user_name: user.displayName || 'no-id-found',
                    })
                )
            )}">${await renderMath(filter.clean(text))}</p>${
                sendFooter ? footer : ''
            }`
        )
    } catch (error) {
        if (error.data && error.data.error) {
            if (
                error.data.error.code &&
                error.data.error.code === 'context_length_exceeded'
            ) {
                return textData(
                    `<b>⛔️ Error</b><br>You have gone over the 4096 token limit. ${
                        replyMsgs.length > 0
                            ? 'You may want to try again without replying to a message.'
                            : 'You may want to shorten your prompt.'
                    }`
                )
            }
            if (error.data.error.message) {
                throw new Error(error.data.error.message)
            }
        }
        throw new Error(error.message)
    }
}
