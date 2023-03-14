import { textData } from '../util/botData'

export const random = (m, a, user, c) => {
    const start = parseInt(a[0])
    const end = parseInt(a[1])

    if (isNaN(start) || isNaN(end) || start > end || start < 0 || end < 0)
        return textData(
            'You must provide 2 valid positive numbers such as below:<br><br><b>!random 1 10</b>'
        )

    const random = Math.floor(Math.random() * (end - start + 1)) + start
    return textData(`🎲 Your number: <b>${random}</b>`)
}
