import { FakeRSSResponse } from './response'
// bot will send nothing to user

const escape = s => s.replace(/</g, '&lt;').replace(/>/g, '&gt;')
export const ignoreData = () =>
    FakeRSSResponse({
        response: '',
        sendResponse: false,
        status: 'ignore',
    })

export const textData = text =>
    FakeRSSResponse({
        response: escape(text),
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
        response: escape(errMsg),
        sendResponse: true,
        responseType: 'text',
        status: 'error',
    })

export const errorData = error =>
    FakeRSSResponse({
        response: escape(
            `An internal error occured while running your command:<br><br>Error Details: ${error.message}`
        ),
        sendResponse: true,
        responseType: 'text',
        status: 'error',
    })
