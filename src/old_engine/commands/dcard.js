import { cardData, textData } from '../util/botData'
import { baseCard } from '../util/adaptivecard'

export const dcard = (m, a) => {
    // const [, subreddit, filter, amount] = m.split(' ')
    // return cardData({
    //     ...baseCard(),
    //     body: [
    //         {
    //             type: 'TextBlock',
    //             size: 'Medium',
    //             weight: 'Bolder',
    //             text: 'My amazing test card',
    //         },
    //         // {
    //         //     type: 'Media',
    //         //     altText: 'Hello there',
    //         //     spacing: 'Small',
    //         //     sources: [
    //         //         {
    //         //             mimeType: 'video/mp4',
    //         //             url:
    //         //                 'https://raw.githubusercontent.com/f1shy-dev/random-cdn/main/sample-10s.mp4',
    //         //         },
    //         //     ],
    //         // },
    //     ],
    // })
    return textData(`<img src="https://math.vercel.app/?bgcolor=auto&from=%5Ctext%7BEdit%20this%7D%5C%20%5CLaTeX.svg" />`)
}
