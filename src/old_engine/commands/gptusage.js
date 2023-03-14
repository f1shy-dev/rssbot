import { textData } from '../util/botData'

export const gptusage = async (m, a, user, conf) => {
    console.log(m)
    return fetch('https://api.openai.com/dashboard/billing/credit_grants', {
        headers: {
            Authorization: `Bearer ${OPENAI_KEY}`,
        },
    })
        .then(response => {
            if (response.ok) {
                return response.json()
            }
            console.log(response)
            console.log(response.json())
            throw new Error(response.statusText)
        })
        .then(data => {
            console.log(data)
            let effective = new Date(0);
            effective.setUTCSeconds(data.grants.data[0].effective_at);

            let expires = new Date(0);
            expires.setUTCSeconds(data.grants.data[0].expired_at);
            // show amount of dollars used/left and percentae and next line show the date range
            //Account has used $0.00 of $18 (per%), with the credits expiring on date
            // round the amounts to 2dp

            const total_granted = data.grants.data[0].grant_amount
            const total_used = data.grants.data[0].used_amount
            // let effective_at = new Date(0)
            // effective_at.setUTCSeconds(data.grants.data[0].effective_at)
            let expires_at = new Date(0)
            expires_at.setUTCSeconds(data.grants.data[0].expires_at)

            // 1st May 2023
            expires_at = expires_at.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
            return textData(`Account has used $${total_used.toFixed(2)} of $${total_granted} (${(total_used / total_granted * 100).toFixed(2)}%), with the credits expiring on ${expires_at}`)

            /* example data response
            {
  "object": "credit_summary",
  "total_granted": 18.0,
  "total_used": 0.146876,
  "total_available": 17.853124,
  "grants": {
    "object": "list",
    "data": [
      {
        "object": "credit_grant",
        "id": "07216282-5bc8-4629-b610-6c95dd196b32",
        "grant_amount": 18.0,
        "used_amount": 0.146876,
        "effective_at": 1675555200.0,
        "expires_at": 1685577600.0
      }
    ]
  }
}
*/
        })
        .catch(error => {
            console.log(error)
            return textData(error.message)
        })

}
