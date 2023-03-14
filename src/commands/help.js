import { commandDescriptions } from ".";
import { textData } from "../util/botData";

export const help = async ({ msg, args, user, config, msgData, mentionToken, replyMessage }) => {
    const commands = Object.keys(config.commands)
    const commandsList = commands.sort()
        .map((cmd) => {
            return `<li><b>${config.prefix}${cmd}</b> - ${commandDescriptions[cmd]}</li>`
        })
        .join('')

    return textData(
        `<p><b>All Commands</b></p>
        <ul>
            ${commandsList}
        </ul>`
    )
}
