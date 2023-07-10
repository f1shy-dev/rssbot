import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { textData } from '../../util/botData'
import { getSourcesFromDDG, getTextFromURL } from '../../util/sourceParser'
import { getUserLastUsed, setUserLastUsed } from '../../util/user_ratelimit'
import { logTokenEvent } from '../../util/user_tokenlog'
import { cacheSource } from '../../util/source_cache'

export const clarity = async ({
    msg,
    args,
    mArgs,
    user,
    config,
    replyMessage,
    httpRes,
    cmdData,
    event,
}) => {
    let use16k =
        mArgs['16k'] ||
        mArgs['16'] ||
        mArgs['large'] ||
        mArgs['bigtokenlimit'] ||
        (mArgs['1'] && mArgs['6'])

    const parsedQuery = [mArgs['6'] || use16k || [], mArgs._].flat().join(' ')

    // lets just make it use 16k if its longer than 4096, but enforce the ratelimits
    if (parsedQuery.length > 3800) use16k = true
    let tokenLimit = 4096
    if (use16k) {
        if (cmdData['16k_no_ratelimit'].includes(user.id)) tokenLimit = 16384
        else {
            const last_used = await getUserLastUsed(user.id, '16k')
            if (!last_used) tokenLimit = 16384
            //6 hours
            if (Date.now() - last_used > 1000 * 60 * 60 * 6) {
                tokenLimit = 16384
                event.waitUntil(setUserLastUsed(user.id, '16k'))
            } else {
                dayjs.extend(relativeTime)
                const can_use = dayjs(last_used)
                    .add(6, 'hour')
                    .fromNow()
                return textData(
                    `<p><b>🚦 Error - Usage limit</b></p><p>You can make a request with the 16,384 token limit again ${can_use}. Bypass this limit by paying £2/month</p>`
                )
            }
        }
    }

    // limit query length to 500 characters
    if (mArgs._.join(' ').length > 500)
        return textData(
            `<p><b>Error</b></p>
            <p>Query too long. Please keep it under 500 characters.</p>`
        )

    let sources = await getSourcesFromDDG(parsedQuery)
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
                'twitter',
            ].every(b => !s.url.includes(b))
    )

    //seperate blacklist for sites to not get full text from
    const noFullText = ['linkedin', '.pdf', '.doc', '.docx', '.ppt', '.pptx']

    let unblocked = sources.filter(
        s => s.url && noFullText.every(b => !s.url.includes(b))
    )

    // if the query contains a URL, lets fetch the full text from that URL (assuming it isnt already in the sources)
    const urlMatches =
        parsedQuery.match(
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
        ) || []
    urlMatches.map(async url => {
        if (sources.some(s => s.url === url)) return
        unblocked.push({ url })
    })

    const promises = unblocked.slice(0, 4).map(async s => {
        // const full = await getTextFromURL(s.url)
        const full = await Promise.race([
            getTextFromURL(s.url),
            new Promise((r, _) => setTimeout(() => r(null), 800)),
        ])
        if (!full) return s
        return { ...s, full }
    })

    sources = [
        ...(await Promise.all(promises)),
        ...(sources
            .filter(s => !promises.some(u => u.url === s.url))
            .slice(0, 4) || []),
    ]

    // 1 token = 3.8 characters
    const max = Math.floor(
        (tokenLimit - (tokenLimit < 4097 ? 684 : 1600)) * 3.8
    )

    let sliceLen =
        sources.map(i => i.full || i.brief).join('').length > max
            ? max / sources.length
            : max
    // console.log(max, sliceLen, tokenLimit)
    let messages = [
        {
            role: 'system',
            content: `You are a helpful assistant that accurately answers the user's queries based on the given text. You have some special formatting options - you can use HTML lists/indented lists, and you can have bold text with <strong>bold</strong> and italics with <i>italics</i>. You can also define large titles using <span style="font-size:x-large;">title text</span> or you can also use px values in place of x-large. Please use the relevant formatting when you are writing your responses. The current date and time is ${new Date().toLocaleString()}.`,
        },
        {
            role: 'user',
            content: `Provide an answer to the query based on the following sources. Be original, concise (unless told otherwise), accurate, and helpful. Cite sources as [1] or [2] or [3] after each sentence (not just the very end) to back up your answer if needed (Ex: Correct: [1], Correct: [2][3], Incorrect: [1, 2]). You don't have to cite sources if the query doesn't call for it, such as a simple request or if the sources aren't of any relevance (ignore any sources that seem to have not been scraped correctly, such as those with messages about confirming that you're not a robot, and ideally prefer full sources over brief sources). If the query was about a certain website and all sources provided weren't useful then respond generally but make sure to acknowledge that your answer may not be accurate.


            Query: ${parsedQuery}
            

            ${sources
                //full sources first, then brief sources
                .sort(
                    (a, b) =>
                        //sort based on length of full or brief text
                        (b.full || b.brief || '').length -
                        (a.full || a.brief || '').length
                )
                .map((source, idx) =>
                    source.full || source.brief
                        ? `${
                              source.full &&
                              (source.full.length > source.brief.length ||
                                  !source.brief)
                                  ? 'Full'
                                  : 'Brief'
                          } Source [${idx + 1}]:\n${
                              (source.full &&
                                  source.full.length > source.brief.length) ||
                              !source.brief
                                  ? source.full
                                  : source.brief
                          }).slice(
                              0,
                              Math.floor(sliceLen)
                          )}`
                        : false
                )
                .filter(Boolean)
                .join('\n\n')}`.slice(0, max),
        },
    ]
    if (
        args.length == 0 ||
        args.join(' ').length == 0 ||
        args.join(' ').trim().length == 0
    ) {
        return textData(`<b>Search powered text generation command</b><br>Generate text using an AI model. Searches the web for info Run <code>/clarity [what you want to generate - a prompt]</code> to generate something.<br><br>
        <b>Advanced options</b>
        <ul>
            <li><code>-t or --temp or --temperature</code>: set the temperature of the model</li>
            <li><code>-p or --top_p</code>: set the top_p of the model</li>
            <li><code>-p or --presence_penalty</code>: set the presence_penalty of the model</li>
            <li><code>-f or --frequency_penalty</code>: set the frequency_penalty of the model</li>${
                can16kusers.includes(user.id)
                    ? `<li><code>--16k or --16 or --large or --bigtokenlimit</code>: use the 16k model instead of the 4k model (expensive!!)</li>`
                    : ''
            }
        </ul>`)
    }
    const temperature = mArgs.temperature || mArgs.temp || mArgs.t || 0.65
    const top_p = mArgs.top_p || 1
    const presence_penalty = mArgs.presence_penalty || mArgs.presence || 0
    const frequency_penalty = mArgs.frequency_penalty || mArgs.frequency || 0
    console.log(
        `[clarity openai] ${
            messages.map(i => i.content).join(' ').length
        } chars - t${temperature} p${top_p} pp${presence_penalty} fp${frequency_penalty} tl${tokenLimit}`
    )

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
            model: tokenLimit < 4097 ? 'gpt-3.5-turbo' : 'gpt-3.5-turbo-16k',
            messages: messages,
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

        event.waitUntil(
            logTokenEvent(
                user.id,
                user.displayName,
                data.usage.prompt_tokens,
                data.usage.completion_tokens,
                ['clarity', tokenLimit < 4097 ? '4k' : '16k']
            )
        )

        event.waitUntil(
            Promise.all(
                sources
                    .filter(s => s.full)
                    .map(s => cacheSource(s.url, s.brief, s.full))
            )
        )

        let text = data.choices[0].message.content.trim()

        // replace [1] with <a href="url">[1]</a>

        const matches = text.match(/\[\d+\]/g)
        if (matches) {
            matches.forEach(m => {
                const idx = parseInt(m.slice(1, -1)) - 1
                if (sources[idx] && sources[idx].url)
                    text = text.replace(
                        new RegExp(`\\[${idx + 1}\\]`, 'g'),
                        `<a href="${sources[idx].url}">${m}</a>`
                    )
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

        if (tokenLimit > 4096) {
            footer += ` 🚀 This request used the ${tokenLimit} token limit.`
            sendFooter = true
        }

        if (data.usage.total_tokens > tokenLimit - 1) {
            footer += ` <b>🚨 Error: In this request, you have gone over the ${tokenLimit} token limit</b>, and you may have been cut off. You may want to shorten your prompt.`
            sendFooter = true
        }

        if (sendFooter) footer += '</div>'

        // let filter = new Filter()

        //between the text and footer as the <div> acts as new line on ios renderer
        return textData(
            // `<p>${filter.clean(text)}</p>${sendFooter ? footer : ''}`
            `<p>${text}</p>${sendFooter ? footer : ''}`
        )
    } catch (error) {
        if (error.data && error.data.error) {
            if (
                error.data.error.code &&
                error.data.error.code === 'context_length_exceeded'
            ) {
                return textData(
                    `<b>⛔️ Error</b><br>You have gone over the ${tokenLimit} token limit. ${
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
        throw error
    }
}
