import { textData } from '../util/botData'

export const helpCommand = m => {
    // const [, subreddit, filter, amount] = m.split(' ')
    return textData('<p>List of all commands:<br><br><strong>!reddit</strong> - view posts from reddit<br><strong>!help</strong> - shows this help menu</p>')
}
