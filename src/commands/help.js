import { commandMap } from '.'
import { textData } from '../util/botData'

export const help = async ({
    msg,
    args,
    user,
    config,
    msgData,
    mentionToken,
    replyMessage,
}) => {
    let text = `<p><b>All Commands</b></p><br>`
    for (let [category, cmds] of Object.entries(commandMap)) {
        cmds = cmds.filter(cmd =>
            cmd.userids ? cmd.userids.includes(user.id) : true
        )
        if (cmds.length === 0) continue
        text += `<p><b>${category}</b></p><ul>`
        for (cmd of cmds) {
            text += `<li><b>${config.prefix}${cmd.aliases[0]}</b> - ${cmd.description}</li>`
        }
        text += `</ul>`
    }

    return textData(text)
    // const commandsList = commands
    //     .sort()
    //     .map(cmd => {
    //         return `<li><b>${config.prefix}${cmd}</b> - ${commandDescriptions[cmd]}</li>`
    //     })
    //     .join('')

    // return textData(
    //     `<p><b>All Commands</b></p>
    //     <ul>
    //         ${commandsList}
    //     </ul>`
    // )
}
