import { cardData, errorData, textData } from '../../util/botData'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { baseCard } from '../../old_engine/util/adaptivecard'

const getScheduleForPeriod = async (start, end) => {
    let schedules = []
    let done = false
    let page = 1
    while (!done) {
        console.log(`[anime schedule] fetch schedule - p${page}`)
        const res = await fetch('https://graphql.anilist.co/', {
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                query:
                    'query ($weekStart: Int, $weekEnd: Int, $page: Int) {\n  Page(page: $page) {\n    pageInfo {\n      hasNextPage\n      total\n    }\n    airingSchedules(airingAt_greater: $weekStart, airingAt_lesser: $weekEnd) {\n      episode\n      airingAt\n      media {\n        id\n        title {\n          romaji\n          native\n          english\n        }\n        format\n        episodes\n        coverImage {\n          large\n          medium\n        }\n        genres \n        isAdult\n      }\n    }\n  }\n}',
                variables: {
                    weekStart: start,
                    weekEnd: end,
                    page,
                },
            }),
            method: 'POST',
        })

        if (!res.ok) {
            done = true
            return null
        }
        const data = await res.json()
        schedules = schedules.concat(data.data.Page.airingSchedules)
        if (!data.data.Page.pageInfo.hasNextPage) done = true
        else page++
    }
    return schedules
}

const dateToDay = date => {
    const c = new Date()
        .toLocaleString('en', { day: 'numeric', month: 'long' })
        .split(' ')
        .reverse()
    return `${c[0]}${
        Number(c[0]) >= 11 && Number(c[0]) <= 13
            ? 'th'
            : ['st', 'nd', 'rd'][(Number(c[0]) % 10) - 1] || 'th'
    } of ${c[1]}`
}

export const anime = async ({
    msg,
    args,
    user,
    config,
    msgData,
    mentionToken,
    replyMessage,
}) => {
    dayjs.extend(relativeTime)
    let isTommorow = false
    let dateOfStr = dateToDay(new Date())

    let schedules = await getScheduleForPeriod(
        Math.round(Date.now() / 1000),
        Math.round(new Date().setHours(24, 0, 0, 0) / 1000)
    )

    if (schedules === null) {
        return errorData(
            'An error occured while fetching the schedule. Please try again later.'
        )
    }

    if (schedules.length === 0) {
        isTommorow = true
        const tommorow = new Date().setHours(24, 0, 0, 0)
        dateOfStr = dateToDay(tommorow)
        schedules = await getScheduleForPeriod(
            Math.round(tommorow / 1000),
            Math.round(new Date(tommorow).setHours(24, 0, 0, 0) / 1000)
        )
    }

    const groupedSchedules = schedules
        .filter(sch => sch.media.isAdult === false)
        .reduce((groups, schedule) => {
            const key = `${schedule.media.id}-${dayjs
                .unix(schedule.airingAt)
                .format('YYYY-MM-DD')}`
            if (!groups[key]) {
                groups[key] = []
            }
            groups[key].push(schedule)
            return groups
        }, {})

    return cardData({
        ...baseCard(),
        body: [
            {
                type: 'TextBlock',
                text: 'Anime Schedule',
                size: 'Large',
                weight: 'Bolder',
            },
            {
                type: 'TextBlock',
                text: `${
                    isTommorow ? 'There are no more anime airing today. ' : ''
                }Here's the list of ${
                    groupedSchedules.length > 24 ? 'the first 24' : ''
                } anime airing ${
                    isTommorow ? 'tommorow' : 'today'
                }, on the ${dateOfStr}:`,
                wrap: true,
            },
            {
                type: 'Container',
                items: Object.values(groupedSchedules)
                    .slice(0, 24)
                    .map(group => {
                        const airingAt = dayjs.unix(group[0].airingAt)
                        const airingAtRelative = airingAt.fromNow()
                        const { romaji, english, native } = group[0].media.title
                        const title = romaji || english || native
                        const episodes = group
                            .map(schedule => schedule.episode)
                            .join('/')
                        return {
                            type: 'ColumnSet',
                            columns: [
                                {
                                    type: 'Column',
                                    width: 'auto',
                                    items: [
                                        {
                                            type: 'Image',
                                            url:
                                                group[0].media.coverImage
                                                    .large ||
                                                group[0].media.coverImage
                                                    .medium ||
                                                '',
                                            width: '46px',
                                        },
                                    ],
                                },
                                {
                                    type: 'Column',
                                    width: 'stretch',
                                    items: [
                                        {
                                            type: 'TextBlock',
                                            text: title,
                                            weight: 'Bolder',
                                            wrap: true,
                                        },
                                        {
                                            type: 'TextBlock',
                                            text: group[0].media.genres.join(
                                                ', '
                                            ),
                                            spacing: 'None',
                                            wrap: true,
                                        },
                                        {
                                            type: 'TextBlock',
                                            text: `Episode ${episodes}/${group[0]
                                                .media.episodes ||
                                                '?'} airing ${airingAtRelative}`,
                                            spacing: 'None',
                                            wrap: true,
                                        },
                                    ],
                                },
                            ],
                        }
                    }),

                spacing: 'Medium',
            },
        ],
    })
}
