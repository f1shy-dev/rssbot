import { textData } from '../util/botData'

export const gpt = async (m, a, user, conf) => {
    return fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: a.join(' '),
                },
            ],
        }),
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
            return textData(data.choices[0].message.content.trim())
        })
        .catch(error => {
            console.log(error)
            return textData(error.message)
        })
}
