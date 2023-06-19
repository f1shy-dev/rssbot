import { textData } from '../util/botData'
import { renderMath } from '../util/renderMath'

const errTemplate = code =>
    `<b>⛔️ Error</b><br>Error connecting to Bard. Please try again later. (ERR_${code})`

export const bard = async ({
    msg,
    args,
    mArgs,
    user,
    config,
    replyMessage,
    event,
}) => {
    const setPSID = mArgs.setpsid || mArgs.setps
    if (setPSID) {
        if (user.id !== '1e2b0ed7-dd66-4474-bfb2-5cb694e64343')
            return textData("You don't have permission to do this.")
        await MAINKV.put('bard_1psid', setPSID)
        await MAINKV.delete('bard_snlm0e')
        return textData(`Set bard_1psid to ${setPSID} in KV.`)
    }

    const psid_token = (await MAINKV.get('bard_1psid')) || BARD_SECURE_1PSID
    console.log('psid_token', psid_token)
    const baseHeaders = {
        host: 'bard.google.com',
        origin: 'https://bard.google.com',
        referer: 'https://bard.google.com/',
        cookie: `__Secure-1PSID=${psid_token.trim()}`,

        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9,nl;q=0.8',

        'sec-ch-ua':
            '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
        'sec-ch-ua-arch': '"x86"',
        'sec-ch-ua-bitness': '"64"',
        'sec-ch-ua-full-version': '"114.0.5735.106"',
        'sec-ch-ua-full-version-list':
            '"Not.A/Brand";v="8.0.0.0", "Chromium";v="114.0.5735.106", "Google Chrome";v="114.0.5735.106"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-model': '""',
        'sec-ch-ua-platform': '"macOS"',
        'sec-ch-ua-platform-version': '"13.0.0"',
        'sec-ch-ua-wow64': '?0',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'upgrade-insecure-requests': '1',
    }

    let conversationId = '',
        responseId = '',
        choiceId = ''

    // let snlm0e_token = await MAINKV.get('bard_snlm0e')
    let snlm0e_token = null
    if (snlm0e_token === null) {
        const res = await fetch('https://bard.google.com', {
            headers: baseHeaders,
        })
        if (!res.ok) return textData(errTemplate('FAIL_TO_FETCH_SNLM0E'))
        const text = await res.text()
        snlm0e_token = text.match(/SNlM0e":"(.*?)"/)[1]

        event.waitUntil(
            MAINKV.put('bard_snlm0e', snlm0e_token, {
                expirationTtl: 60 * 5,
            })
        )
    }
    const encoded = `f.req=${encodeURIComponent(
        JSON.stringify([
            null,
            JSON.stringify([
                [mArgs._.join(' '), null, null, []],
                [null],
                ['', '', ''],
                null,
                null,
                null,
                [1],
                0,
                [],
            ]),
        ])
    )}&at=${encodeURIComponent(snlm0e_token)}&`

    // const encoded = `f.req=%5Bnull%2C%22%5B%5B%5C%22hello%5C%22%2Cnull%2Cnull%2C%5B%5D%5D%2C%5B%5C%22en-GB%5C%22%5D%2C%5B%5C%22%5C%22%2C%5C%22%5C%22%2C%5C%22%5C%22%5D%2Cnull%2Cnull%2Cnull%2C%5B1%5D%2C0%2C%5B%5D%5D%22%5D&at=${encodeURIComponent(
    //     snlm0e_token
    // )}&`

    // const encoded = `f.req=%5Bnull%2C%22%5B%5B%5C%22niv%5C%22%2Cnull%2Cnull%2C%5B%5D%5D%2C%5B%5C%22en-GB%5C%22%5D%2C%5B%5C%22c_3c230c4fee53d7ae%5C%22%2C%5C%22r_3c230c4fee53d729%5C%22%2C%5C%22rc_3c230c4fee53d0a8%5C%22%5D%2Cnull%2Cnull%2Cnull%2C%5B1%5D%2C0%2C%5B%5D%5D%22%5D&at=AFuTz6vAyb-75sRHNWiJ2UnGA2i3%3A1686241102980&`

    console.log('encoded', encoded)
    const res2 = await fetch(
        `https://bard.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?${new URLSearchParams(
            {
                bl: 'boq_assistant-bard-web-server_20230606.12_p0',
                _reqid: parseInt(
                    Math.random()
                        .toString()
                        .slice(2, 8)
                ).toString(),
                rt: 'c',
            }
        )}`,
        {
            method: 'POST',
            body: encoded,
            headers: {
                ...baseHeaders,
                'content-type':
                    'application/x-www-form-urlencoded, application/x-www-form-urlencoded;charset=UTF-8',
                'x-same-domain': '1',
                authority: 'bard.google.com',
            },
        }
    )

    if (!res2.ok) return textData(errTemplate('FAIL_TO_FETCH_RESPONSE'))
    const text = await res2.text()
    console.log(text)

    return textData(
        `bard kv token: ${snlm0e_token}<br>bard 1psid: ${psid_token.trim()}<br>encoded:${encoded}±±±<br>bardres: ${text}`
    )
}
