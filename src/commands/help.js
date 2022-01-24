import { textData } from '../util/botData'
import { descMap } from '.'

export const help = (m, a) => {
    const text =
        'List of all commands:<br><br>' +
        Object.keys(descMap)
            .map(c => `<b>!${c}</b> - ${descMap[c]}`)
            .join('<br>')
    return textData(text)
}
