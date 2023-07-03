import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { baseCard } from '../../util/adaptivecard'
import { gql } from './common'
import { dateToDay } from '../../util/dates'
const getScheduleForPeriod = async (start, end) => {
    let schedules = []
    let done = false
    let page = 1
    while (!done) {
        console.log(`[anime schedule] fetch schedule - p${page}`)
        const data = await gql(
            'query ($weekStart: Int, $weekEnd: Int, $page: Int) {\n  Page(page: $page) {\n    pageInfo {\n      hasNextPage\n      total\n    }\n    airingSchedules(airingAt_greater: $weekStart, airingAt_lesser: $weekEnd) {\n      episode\n      airingAt\n      media {\n        id\n        title {\n          romaji\n          native\n          english\n        }\n        format\n        episodes\n        coverImage {\n          large\n          medium\n        }\n        genres \n        isAdult\n      }\n    }\n  }\n}',
            {
                weekStart: start,
                weekEnd: end,
                page,
            }
        )
        if (data instanceof Error) {
            console.log('fetcherr', data)
            done = true
            return null
        }

        schedules = schedules.concat(data.Page.airingSchedules)
        if (!data.Page.pageInfo.hasNextPage) done = true
        else page++
    }
    return schedules
}

export const scheduleCardForPeriod = async (
    start,
    end,
    tommorowMode,
    haveAction
) => {
    dayjs.extend(relativeTime)
    const st = new Date(start)
    let dateOfStr = `${dateToDay(st)} ${dayjs(st).format('YYYY')}`
    let schedules = await getScheduleForPeriod(
        Math.round(start / 1000),
        Math.round(end / 1000)
    )

    if (schedules === null) return null
    if (schedules.length === 0) return 0

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

    return {
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
                    tommorowMode ? 'There are no more anime airing today. ' : ''
                }Here's the list of ${
                    groupedSchedules.length > 24 ? 'the first 24 ' : ''
                }anime ${
                    start < Date.now() ? 'that aired' : 'airing'
                } on the ${dateOfStr}:`,
                wrap: true,
            },
            {
                type: 'Container',
                items: Object.values(groupedSchedules)
                    .slice(0, 24)
                    .map(group => {
                        const airingAt = dayjs.unix(group[0].airingAt)
                        // 08:30 if its past or in more than 24 hours

                        const isFuture =
                            airingAt.toDate().getTime() - Date.now() > 86400000
                        const isHrMin = start < Date.now() || isFuture

                        const airingAtRelative = isHrMin
                            ? airingAt.format('HH:mm')
                            : airingAt.fromNow()
                        const { romaji, english, native } = group[0].media.title
                        const title = romaji || english || native
                        let episodes = group
                            .map(schedule => schedule.episode)
                            .join('/')

                        // if its like 1/2/3/4/5/6 then shorten to 1-6 - do it if more than 2 episodes
                        if (group.length > 2) {
                            //check if its sequential in unit of 1
                            const isSequential = group.every(
                                (schedule, i) =>
                                    i === 0 ||
                                    schedule.episode ===
                                        group[i - 1].episode + 1
                            )
                            if (isSequential) {
                                episodes = `${group[0].episode}-${
                                    group[group.length - 1].episode
                                }`
                            }
                        }

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
                                                .media.episodes || '?'} ${
                                                start < Date.now()
                                                    ? 'aired at'
                                                    : isFuture
                                                    ? 'will air at'
                                                    : 'airing'
                                            } ${airingAtRelative}`,
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
        actions: haveAction
            ? [
                  {
                      type: 'Action.ShowCard',
                      title: 'See schedule for different date',
                      card: {
                          version: '1.4',
                          type: 'AdaptiveCard',
                          body: [
                              {
                                  type: 'TextBlock',
                                  size: 'Medium',
                                  text:
                                      "Please pick the date you'd like to see the anime airing schedule for.",
                                  wrap: true,
                              },
                              {
                                  type: 'Input.Date',
                                  label: 'Date',
                                  id: 'scheduleDate',
                                  isRequired: true,
                                  errorMessage: 'Date is required',
                              },
                          ],
                          actions: [
                              {
                                  type: 'Action.Submit',
                                  title: 'Submit',
                                  data: {
                                      card_id: 'anime/schedule/different-date',
                                  },
                              },
                          ],
                      },
                  },
              ]
            : [],
    }
}
