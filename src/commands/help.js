import { textData } from '../util/botData'

export const helpCommand = msg => {
    const commands = {
        reddit: 'view posts from reddit',
        help: 'show this help menu',
        ping: '🏓 pong!',
    }

    const text =
        'List of all commands:<br><br>' +
        Object.keys(commands)
            .map(c => `<b>!${c}</b> - ${commands[c]}`)
            .join('<br>')
    return textData(text)
}
