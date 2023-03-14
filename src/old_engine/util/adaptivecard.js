import { esc } from './botData'

export const textCard = text => ({
    ...baseCard(),
    body: [
        {
            type: 'TextBlock',
            text: esc(text),
            wrap: true,
        },
    ],
})

export const baseCard = () => ({
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.4',
})
