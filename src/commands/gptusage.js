import { textData } from '../util/botData'

export const gptusage = async ({ msg, args, user, config, msgData, mentionToken, replyMessage }) => {
    let res = await fetch('https://api.openai.com/dashboard/billing/credit_grants', {
        headers: {
            Authorization: `Bearer ${OPENAI_KEY}`,
        },
    })

    if (!res.ok) {
        throw new Error(response.statusText)
    }

    const data = await res.json()
    let expires = new Date(0);
    expires.setUTCSeconds(data.grants.data[0].expired_at);

    const total_granted = data.grants.data[0].grant_amount
    const total_used = data.grants.data[0].used_amount
    let expires_at = new Date(0)
    expires_at.setUTCSeconds(data.grants.data[0].expires_at)

    expires_at = expires_at.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    return textData(`Account has used $${total_used.toFixed(2)} of $${total_granted} (${(total_used / total_granted * 100).toFixed(2)}%), with the credits expiring on ${expires_at}`)
}
