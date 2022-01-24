import { FakeRSSResponse } from './response'

const esc = s =>
    `<p>${s
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/<b>/g, '<strong>')
        .replace(/<\/b>/g, '</strong>')
        .replace(/\n/g, '<br>')}</p>`

export const ignoreData = () =>
    FakeRSSResponse({
        response: '',
        sendResponse: false,
        status: 'ignore',
    })

export const textData = text =>
    FakeRSSResponse({
        response: esc(text),
        sendResponse: true,
        responseType: 'text',
        status: 'ok',
    })

export const cardData = card =>
    FakeRSSResponse({
        response: card,
        sendResponse: true,
        responseType: 'card',
        status: 'ok',
    })

export const simpleErrorData = errMsg =>
    FakeRSSResponse({
        response: esc(errMsg),
        sendResponse: true,
        responseType: 'text',
        status: 'error',
    })

export const errorData = error =>
    FakeRSSResponse({
        response: esc(
            `An internal error occured while running your command:<br><br>Error Details: ${error.message}`
        ),
        sendResponse: true,
        responseType: 'text',
        status: 'error',
    })
