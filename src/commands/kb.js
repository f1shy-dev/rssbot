import { textData } from '../util/botData'
import Fuse from 'fuse.js'

import linkDB from '../data/kerboodle_more.json'

export const kb = async ({
    msg,
    args,
    mArgs,
    user,
    config,
    msgData,
    mentionToken,
    replyMessage,
}) => {
    // const noBook = `Either run <code>/kb all</code> to see all the books, or run <code>/kb [book search - one word] [page search]</code> to see a specific page. Valid subjects are: ${linkDB
    // .map(x => x.subject)
    // .join(', ')}`
    const noBook = `<br><br>📃 Run <code>/kb [book name - one word] -p [number]</code> to see a specific page.<br>🔎 Run <code>/kb [book name - one word] [page search]</code> to search for a page.<br>📚 Run <code>/kb all</code> to see all the books.<br>📔 Valid subjects are: ${linkDB.map(x => x.subject).join(', ')}`

    // should be like /kb <chem|physics|>, use the same error format as the gpt command
    if (args.length == 0) {
        return textData(
            `<b>Kerboodle command</b><br>Access any of the kerboodle books, with no login required.` +
            noBook
        )
    }
    if (args.join(' ') == 'all') {
        let text = `<p><b>📚 Here are all the ${linkDB.length} books:</b></p><ul>`
        for (let i = 0; i < linkDB.length; i++) {
            text += `<li><b>🔗 ${linkDB[i].fullName}</b> - <a href="${linkDB[i].link}">Click here to open</a></li>`
        }
        text += `</ul><br>📃 Run <code>/kb [book name - one word] -p [number]</code> to see a specific page.<br>🔎 Run <code>/kb [book name - one word] [page search]</code> to search for a page.`
        return textData(text)
    }


    const bookName = mArgs.b || mArgs._[0];
    const bookFuse = new Fuse((linkDB), {
        keys: ["fullName", "subject"], threshold: 0.2,
    })
    const bookResult = bookFuse.search(bookName.toLowerCase())
    if (!bookResult.length) {
        return textData(
            `<b>😬 Whoops...</b><br>Could not find a book matching your search. ` +
            noBook
        )
    }
    const book = bookResult[0].item;

    let pageNum = mArgs.p;
    if (!pageNum) {
        const fuse = new Fuse(book.pages, {
            keys: ['t'],
            threshold: 0.3,
        })
        const query = mArgs._.join(' ').toLowerCase().replaceAll(/(page)/g, '').replace(bookName.toLowerCase(), '').trim()
        if (query == '') return textData(`<b>📖 ${book.fullName}</b><br><br><a href="${book.link}">🔗 Click here to open the book in your browser.</a><br>📃 Run <code>/kb ${book.subject.toLowerCase()} -p [number]</code> to see a specific page.<br>🔎 Run <code>/kb ${book.subject.toLowerCase()} [page search]</code> to search for a page.<br>📚 Run <code>/kb all</code> to see the rest of the books.`)

        const result = fuse.search(query)
        if (!result.length) {
            return textData(
                `< b >😬 Whoops...</b > <br>Could not find a page matching your search. ` +
                noBook
            )
        }
        pageNum = book.pages.indexOf(result[0].item)
    } else {
        pageNum = parseInt(pageNum) - 1 - book.offset
    }

    const page = book.pages[parseInt(pageNum)]
    const page2 = book.pages[parseInt(pageNum) + 1]
    if (!page) return textData(
        `<b>😬 Whoops...</b><br>Could not find a page matching your search. ` +
        noBook
    )

    const getURL = (page) => {
        let baseURL = page.u;
        Object.keys(book.urlCompressionKeys).forEach(i => {
            baseURL = baseURL.replace(i, book.urlCompressionKeys[i])
        })

        baseURL = book.cdn + baseURL + "." + book.format;
        return baseURL;
    }

    if (page2 && page.t && (!page2.t)) {
        return textData(`<p><b>📖 <a href=${book.link}><b>${book.subject}</b></a> - ${page.t}</b></p><img src="${getURL(page)}" style="width: ${page.w}px; height: ${page.h}px;"><img src="${getURL(page2)}" style="width: ${page2.w}px; height: ${page2.h}px;"><br><p style="font-size:x-small;">This was the closest match to your search. Wrong page? Try narrowing your search and trying again.</p>`)
    }

    return textData(`<p><b>📖 <a href=${book.link}><b>${book.subject}</b></a> - ${page.t ? page.t : `Page #${mArgs.p}`}</b></p><img src="${getURL(page)}" style="width: ${page.w}px; height: ${page.h}px;"><br><p style="font-size:x-small;">This was the closest match to your search. Wrong page? Try narrowing your search and trying again.</p>`)



    // const subject = args.join(' ').toLowerCase()
    // const fuse = new Fuse(linkDB, {
    //     keys: ['subject', 'fullName'],
    //     threshold: 0.3,
    //     includeScore: true,
    // })
    // const results = fuse.search(subject)
    // if (results.length == 0) {
    //     return textData(
    //         `<b>😬 Whoops...</b><br>Could not find a book matching your search. ` +
    //         noBook
    //     )
    // }

    // //show top 3 results
    // let text = `<p><b>📚 Here are the top 3 results for your search:</b></p><ul>`
    // for (let i = 0; i < Math.min(3, results.length); i++) {
    //     // with bold text of book name
    //     text += `<li><b>🔗 ${results[i].item.fullName}</b> - <a href="${results[i].item.link}">Click here to open</a></li>`
    // }
    // text += `</ul>`
    // return textData(text)
}
