import { textData } from '../util/botData'

export const randomcase = (m, a) => {
    //m includes the command, so we need to remove it
    return textData(
        m
            .split(' ')
            .slice(1)
            .join(' ')
            .split('')
            .map(c => (Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()))
            .join('')
    )
}
