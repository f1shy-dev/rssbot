import { textData } from '../util/botData'
import { renderMath } from '../util/renderMath'
import { getGPTMessagesFromReply } from '../util/replyParser'
import Filter from 'bad-words'
import { getSourcesFromDDG, getTextFromURL } from '../util/sourceParser'

export const clarity = async ({
    msg,
    args,
    mArgs,
    user,
    config,
    replyMessage,
}) => {
    // limit query length to 500 characters
    if (mArgs._.join(' ').length > 500)
        return textData(
            `<p><b>Error</b></p>
            <p>Query too long. Please keep it under 500 characters.</p>`
        )

    let sources = await getSourcesFromDDG(mArgs._.join(' '))
    if (!sources)
        return textData(
            `<p><b>Error</b></p>
            <p>Could not find any sources for your query.</p>`
        )

    sources = sources.filter(
        s =>
            s.url &&
            [
                //blacklist
                'google',
                'facebook',
                'instagram',
                'youtube',
                'tiktok',
            ].every(b => !s.url.includes(b))
    )

    //seperate blacklist for sites to not get full text from
    const noFullText = ['linkedin']

    let unblocked = sources.filter(
        s => s.url && noFullText.every(b => !s.url.includes(b))
    )

    const promises = unblocked.slice(0, 2).map(async s => {
        const full = await getTextFromURL(s.url)
        if (!full) return s
        return { ...s, full }
    })

    sources = [
        ...(await Promise.all(promises)),
        ...(sources.filter(s => !unblocked.includes(s)).slice(0, 2) || []),
    ]

    let messages = [
        {
            role: 'system',
            content: `You are a helpful assistant that accurately answers the user's queries based on the given text. You have some special formatting options - you can use HTML lists/indented lists, and you can have bold text with <strong>bold</strong> and italics with <i>italics</i>. You can also define large titles using <span style="font-size:x-large;">title text</span> or you can also use px values in place of x-large. Please use the relevant formatting when you are writing your responses.`,
        },
        {
            role: 'user',
            content: `Provide a 2-3 sentence answer to the query based on the following sources. Be original, concise, accurate, and helpful. Cite sources as [1] or [2] or [3] after each sentence (not just the very end) to back up your answer (Ex: Correct: [1], Correct: [2][3], Incorrect: [1, 2]).

            Query: ${mArgs._.join(' ')}
      
      ${sources
          .map((source, idx) =>
              source.full || source.brief
                  ? `Source [${idx + 1}]:\n${source.full || source.brief}`
                  : false
          )
          .filter(Boolean)
          .join('\n\n')}`.slice(0, 4095),
        },
    ]
    if (
        args.length == 0 ||
        args.join(' ').length == 0 ||
        args.join(' ').trim().length == 0
    ) {
        return textData(`<b>Search powered text generation command</b><br>Generate text using an AI model. Searches the web for info Run <code>/gpt [what you want to generate - a prompt]</code> to generate something.<br><br>
        <b>Advanced options</b>
        <ul>
            <li><code>-t or --temp or --temperature</code>: set the temperature of the model</li>
            <li><code>-p or --top_p</code>: set the top_p of the model</li>
            <li><code>-p or --presence_penalty</code>: set the presence_penalty of the model</li>
            <li><code>-f or --frequency_penalty</code>: set the frequency_penalty of the model</li>
        </ul>`)
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: messages,
            temperature: mArgs.temperature || mArgs.temp || mArgs.t || 1,
            top_p: mArgs.top_p || 1,
            presence_penalty: mArgs.presence_penalty || mArgs.presence || 0,
            frequency_penalty: mArgs.frequency_penalty || mArgs.frequency || 0,
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

        // replace [1] with <a href="url">[1]</a>

        const matches = text.match(/\[\d+\]/g)
        if (matches) {
            matches.forEach(m => {
                const idx = parseInt(m.slice(1, -1)) - 1
                if (sources[idx] && sources[idx].url)
                    text.replace(m, `<a href="${sources[idx].url}">${m}</a>`)
            })
        }

        //<span style=\"font-size:xx-small\">You replied to a message, so you are in a conversation with 7 messages. You used: 372 tokens.</span>
        let sendFooter = false
        let footer = `<br><div style="font-size:x-small">`

        // if (data.usage.total_tokens > 2400 && data.usage.total_tokens < 4096) {
        //     footer += ` 🟠 Warning: ${
        //         replyMsgs.length > 0 ? 'You have ' : 'In this request, you '
        //     }used ${data.usage.total_tokens} tokens of the 4096 token limit.`
        //     sendFooter = true
        // }

        if (data.usage.total_tokens > 4095) {
            footer += ` <b>🚨 Error: In this request, you havegone over the 4096 token limit</b>, and you may have been cut off. You may want to shorten your prompt.`
            sendFooter = true
        }

        if (sendFooter) footer += '</div>'

        let filter = new Filter()

        //between the text and footer as the <div> acts as new line on ios renderer
        return textData(
            `<p>${filter.clean(text)}</p>${sendFooter ? footer : ''}`
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
