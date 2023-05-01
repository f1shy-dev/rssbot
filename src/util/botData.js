import { JSONResponse } from './response'

export const esc = s => {
    //<p>🚨 warning: v2 handler mode on</p><br>
    let m = s.includes('<') ? s.trim() : `<p>${s.trim()}</p>`

    // .replace(/</g, '&lt;')
    // .replace(/>/g, '&gt;')
    // .replace(/<b>/g, '<strong>')
    // .replace(/<\/b>/g, '</strong>')
    // .replace(/\n/g, '<br>')}
    m = m.replace(/<b>/g, '<strong>')
    m = m.replace(/<\/b>/g, '</strong>')
    // m = m.replace(/</g, '&lt;')
    // m = m.replace(/>/g, '&gt;')
    // m = m.replace(/\n/g, '<br>')

    m = m.trim()
    return m
}

export const ignoreData = () =>
    JSONResponse({
        response: '',
        sendResponse: false,
        status: 'ignore',
    })

export const textData = text =>
    JSONResponse({
        response: esc(text),
        // response: text,
        sendResponse: true,
        responseType: 'text',
        status: 'ok',
    })

export const cardData = card =>
    JSONResponse({
        response: card,
        sendResponse: true,
        responseType: 'card',
        status: 'ok',
    })

export const simpleErrorData = errMsg =>
    JSONResponse({
        response: esc(errMsg),
        sendResponse: true,
        responseType: 'text',
        status: 'error',
    })

export const errorData = error =>
    JSONResponse({
        response: esc(
            `<b>⛔️ Error</b><br>An error occured while running your command.<br><br><b>Details</b><br>${error.message}`
        ),
        sendResponse: true,
        responseType: 'text',
        status: 'error',
    })
