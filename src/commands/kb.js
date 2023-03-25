import { textData } from '../util/botData'
import Fuse from 'fuse.js'

import linkDB from '../data/kerboodle.json'

export const kb = async ({ msg, args, user, config, msgData, mentionToken, replyMessage }) => {
    const noBook = `Either run <code>/kb all</code> to see all the books, or run <code>/kb [subject]</code> to see the books for a subject. Valid subjects are: ${linkDB.map(x => x.subject).join(', ')}`

    // should be like /kb <chem|physics|>, use the same error format as the gpt command
    if (args.length == 0) {
        return textData(`<b>Kerboodle command</b><br>Fetch the links for any of the kerboodle books, with no login required. <br><br>` + noBook)
    }
    if (args.join(' ') == "all") {
        let text = `<p><b>📚 Here are all the ${linkDB.length} books:</b></p><ul>`
        for (let i = 0; i < linkDB.length; i++) {
            text += `<li><b>🔗 ${linkDB[i].fullName}</b> - <a href="${linkDB[i].link}">Click here to open</a></li>`
        }
        text += `</ul>`
        return textData(text)
    }

    const subject = args.join(' ').toLowerCase()
    const fuse = new Fuse(linkDB, {
        keys: ['subject', 'fullName'],
        threshold: 0.3,
        includeScore: true
    })
    const results = fuse.search(subject)
    if (results.length == 0) {
        return textData(`<b>😬 Whoops...</b><br>Could not find a book matching your search. ` + noBook)
    }

    //show top 3 results
    let text = `<p><b>📚 Here are the top 3 results for your search:</b></p><ul>`
    for (let i = 0; i < Math.min(3, results.length); i++) {
        // with bold text of book name
        text += `<li><b>🔗 ${results[i].item.fullName}</b> - <a href="${results[i].item.link}">Click here to open</a></li>`
    }
    text += `</ul>`
    return textData(text)
}