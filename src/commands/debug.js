import { textData } from '../util/botData'

export const ping = (m, a, conf) =>
    textData(
        `<b>Debug Data</b><br><br><b>${conf.commands}</b> commands loaded<br>prefix: <b>${conf.prefix}</b><br><br><b>plaintext message data:</b><br>${m}`
    )
