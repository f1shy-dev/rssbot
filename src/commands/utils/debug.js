import { cardData, textData } from '../../util/botData'
import { renderMath } from '../../util/renderMath'
import { getGPTMessagesFromReply } from '../../util/replyParser'
import linkDB from '../../data/kerboodle_more.json'
import Fuse from 'fuse.js'
import { baseCard } from '../../old_engine/util/adaptivecard'

export const debug = async ({
    msg,
    args,
    user,
    config,
    msgData,
    mentionToken,
    replyMessage,
    mArgs,
}) => {
    let mode = mArgs.mode || mArgs.m || 'help'

    //dictionary of functions to call
    const header = (i, list) =>
        `<p><b>Debug${i ? ` - ${i}` : ''}</b></p>${list ? `<ul>` : ''}`
    const modeFunctions = {
        // [mode]: () => [title, list (bool), html data]
        // 'commands': () => ["Commands", false, `<b></b> commands loaded`],
        prefix: () => ['Bot Prefix', false, config.prefix],
        video_card: () => [
            'Video Card',
            'card',
            [
                {
                    type: 'Media',
                    sources: [
                        {
                            mimeType: 'video/mp4',
                            url:
                                'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4',
                        },
                    ],
                },
            ],
        ],
        msg: () => [
            'Message Data',
            true,
            `<li><b>Your message JSON</b>: ${JSON.stringify(
                msgData
            )}</li><li><b>Your message</b>: ${msg}</li><li><b>Your message HTML content</b>: ${JSON.stringify(
                msgData.body.content || ''
            )}</li><li><b>Your message HTML content escaped</b>: ${JSON.stringify(
                msgData.body.content
                    ? msgData.body.content
                          .replace(/</g, '&lt;')
                          .replace(/>/g, '&gt;')
                    : '[no content]'
            )}</li><li><b>Minimist args</b>: ${JSON.stringify(mArgs)}</li>`,
        ],
        replyMsg: () => [
            'Reply Message Data',
            replyMessage.body ? true : false,
            !replyMessage.body
                ? `<p>No reply message found...</p>`
                : `<li><b>Reply message JSON</b>: ${JSON.stringify(
                      replyMessage
                  )}</li><li><b>Reply message HTML content</b>: ${JSON.stringify(
                      replyMessage.body.content || ''
                  )}</li><li><b>Reply message HTML content escaped</b>: ${JSON.stringify(
                      replyMessage.body.content
                          ? replyMessage.body.content
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;')
                          : '[no content]'
                  )}</li>`,
        ],
        replyMsgs: () => [
            'CPT Messages',
            replyMessage.body ? true : false,
            !replyMessage.body
                ? `<p>No reply message found...</p>`
                : `<li><b>CPT messages</b>: ${JSON.stringify(
                      getGPTMessagesFromReply(replyMessage).replyMsgs
                  )}</li>`,
        ],
        user: () => [
            'User Data',
            true,
            `<li><b>User JSON</b>: ${JSON.stringify(
                user
            )}</li><li><b>User ID</b>: ${user.id}</li>`,
        ],
        math: async () => [
            'Math Rendering',
            false,
            await renderMath(mArgs._.join(' ')),
        ],
        image: () => [
            'Image Test',
            false,
            `URL: <a href="${mArgs._.join(' ')}">${mArgs._.join(
                ' '
            )}</a><br><img src="${mArgs._.join(' ')}">`,
        ],
        kbtest: () => {
            // either /debug -m kbtest -b [book] -p [page] or /debug -m kbtest [one word to search book] [search]
            const bookName = mArgs.b || mArgs._[0]
            const bookFuse = new Fuse(linkDB, {
                keys: ['fullName', 'subject'],
                threshold: 0.2,
            })
            const bookResult = bookFuse.search(bookName.toLowerCase())
            if (!bookResult.length) {
                return [
                    'Kerboodle Test',
                    false,
                    `<p>Page not found</p><br><p>Book Query: ${bookName}</p>`,
                ]
            }
            const book = bookResult[0].item

            let pageNum = mArgs.p
            if (!pageNum) {
                const fuse = new Fuse(book.pages, {
                    keys: ['t'],
                    threshold: 0.3,
                })
                const query = mArgs._.join(' ')
                    .toLowerCase()
                    .replaceAll(/(page)/g, '')
                    .replace(bookName.toLowerCase(), '')
                    .trim()
                const result = fuse.search(query)
                if (!result.length) {
                    return [
                        'Kerboodle Test',
                        false,
                        `<p>Page not found</p><br><p>Book: ${book.subject}</p><p>Query: ${query}</p><p>Book Query: ${bookName}</p>`,
                    ]
                }
                pageNum = book.pages.indexOf(result[0].item)
            } else {
                pageNum = parseInt(pageNum) - 1 - book.offset
            }

            const page = book.pages[parseInt(pageNum)]
            const page2 = book.pages[parseInt(pageNum) + 1]
            if (!page) return ['Kerboodle Test', false, `<p>Page not found</p>`]

            const getURL = page => {
                let baseURL = page.u
                Object.keys(book.urlCompressionKeys).forEach(i => {
                    baseURL = baseURL.replace(i, book.urlCompressionKeys[i])
                })

                baseURL = book.cdn + baseURL + '.' + book.format
                return baseURL
            }

            if (page2 && page.t && !page2.t) {
                return [
                    'Kerboodle Test',
                    false,
                    `<p>${book.subject} - ${page.t}</p><img src="${getURL(
                        page
                    )}" style="width: ${page.w}px; height: ${
                        page.h
                    }px;"><img src="${getURL(page2)}" style="width: ${
                        page2.w
                    }px; height: ${page2.h}px;">`,
                ]
            }

            return [
                'Kerboodle Test',
                false,
                `<p>${book.subject} - ${
                    page.t ? page.t : `Page #${mArgs.p}`
                }</p><img src="${getURL(page)}" style="width: ${
                    page.w
                }px; height: ${page.h}px;">`,
            ]
        },
    }

    if (!Object.keys(modeFunctions).includes(mode) || mArgs.h || mArgs.help)
        mode = 'help'
    if (mode == 'help')
        return textData(
            `<p><b>Debug command help</b></p ><p>Usage: <code>${
                config.prefix
            }debug -m [mode] [optional input]</code></p><p>Available modes: ${Object.keys(
                modeFunctions
            )
                .map(i => `<code>${i}</code>`)
                .join(', ')}</p>`
        )

    const mf = await modeFunctions[mode]()
    if (mf[1] === 'card' && typeof mf[2] == 'object')
        return cardData({
            ...baseCard(),
            body: mf[2],
        })

    return textData(
        `${header(mf[0], mf[1])}${mf[2].toString()}${mf[1] ? `</ul>` : ''}`
    )
}
