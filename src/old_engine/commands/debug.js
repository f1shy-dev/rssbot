import { textData } from '../util/botData'

export const debug = (m, a, user, conf) => {
    let data = JSON.stringify({
        chat_history: [
            {
                role: 'system',
                //test
                content:
                    'You are a helpful assistant called ChatGPT, but you have some special formatting options. If you want to output maths, you should use a LaTeX format, inside brackets like this {{{{<latex>}}}} such as x squared which would be {{{{x^2}}}}.',
            },
        ],
    })
    //atob/btoa
    let b64_data = btoa(data)
    return textData(
        `<div itemprop="rssbot-cpt-encoding####${b64_data}"></div><b>Debug Data</b><br>
        <ul>
            <li><b>${Object.keys(conf.commands).length}</b> commands loaded</li>
            <li>bot prefix: <b>${conf.prefix}</b></li>
            <li>user info: <b>${JSON.stringify(user, null, 2)}</b></li>
        </ul>
        
        <br><b>Plain-text message:</b><br>${m}`
    )
}
