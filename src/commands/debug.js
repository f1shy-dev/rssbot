import { textData } from '../util/botData'

export const debug = (m, a, conf) =>
    textData(
        `<b>Debug Data</b><br><ul><li><b>${
            Object.keys(conf.commands).length
        }</b> commands loaded</li><li>bot prefix: <b>${
            conf.prefix
        }</b></li></ul><br><b>Plain-text message:</b><br>${m}`
    )
