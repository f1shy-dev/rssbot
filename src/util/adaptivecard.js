export const textCard = text => ({
    ...baseCard(),
    body: [
        {
            type: 'TextBlock',
            text,
            wrap: true,
        },
    ],
})

export const baseCard = () => ({
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.3',
})
