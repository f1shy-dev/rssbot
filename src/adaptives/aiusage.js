import dayjs from 'dayjs'
import { cardData, ignoreData, updateCardData } from '../util/botData'
import { baseCard } from '../util/adaptivecard'

export const aiusage = async ({ user, outputs }) => {
    if (!outputs || !outputs.start_date || !outputs.end_date || !outputs.users)
        return ignoreData()

    const users = [outputs.users].flat()
    const event_db = (await MAINKV.get(`tokenlog`, { type: 'json' })) || {}
    const userMap = event_db.userMap || {}
    const events = event_db.events || {}
    // const now = Date.now()
    // set start date to 00:00:00
    const start_date = new Date(outputs.start_date).setHours(0, 0, 0, 0)
    const end_date = new Date(outputs.end_date).setHours(23, 59, 59, 999)

    let chart = {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    data: [],
                    backgroundColor: 'rgb(53,54,106)',
                },
            ],
        },
        options: {
            plugins: { legend: { display: false } },
            title: { display: false },
            scales: {
                x: {
                    ticks: { color: 'rgb(53,54,106)' },
                    grid: { color: 'rgb(29,29,29)' },
                },
                y: {
                    ticks: { color: 'rgb(53,54,106)' },
                    grid: { color: 'rgb(29,29,29)' },
                },
            },
        },
    }
    console.log(users)
    if (users.length === 1) {
        console.log('single user')
        // if its lessthan/equal to 30 days, show by day
        // if its less than 1 year, show by month (but if its like 5 weeks then do like ["Jan", "Feb - 1w"])

        const start = dayjs(start_date)
        const end = dayjs(end_date)
        const diff = end.diff(start, 'day')

        if (diff == 0) {
            // hours
            const usage = {}
            for (const timestamp in events[users[0]]) {
                if (
                    start_date > Number(timestamp) ||
                    end_date < Number(timestamp)
                )
                    continue
                const fmt = dayjs(Number(timestamp)).format('h A')
                if (!usage[fmt]) usage[fmt] = 0
                usage[fmt] +=
                    events[users[0]][timestamp].pt +
                    events[users[0]][timestamp].ct
            }
            // fill any gaps in the hours with 0
            const hours = {}
            for (let c = 0; c <= 23; c++) {
                const hour = start.add(c, 'hour').format('h A')
                hours[hour] = usage[hour] || 0
            }
            Object.entries(hours).forEach(([hour, count]) => {
                chart.data.labels.push(hour)
                chart.data.datasets[0].data.push(count)
            })
        } else if (diff <= 30) {
            const usage = {}
            for (const timestamp in events[users[0]]) {
                if (
                    start_date > Number(timestamp) ||
                    end_date < Number(timestamp)
                )
                    continue
                const fmt = dayjs(Number(timestamp)).format('MMM D')
                if (!usage[fmt]) usage[fmt] = 0

                usage[fmt] +=
                    events[users[0]][timestamp].pt +
                    events[users[0]][timestamp].ct
            }
            // fill any gaps in the days with 0
            const days = {}
            for (let c = 0; c <= diff; c++) {
                const day = start.add(c, 'day').format('MMM D')
                days[day] = usage[day] || 0
            }
            Object.entries(days).forEach(([day, count]) => {
                chart.data.labels.push(day)
                chart.data.datasets[0].data.push(count)
            })
        } else if (diff <= 365) {
            const usage = {}
            const fullMonths = [...Array(Math.floor(diff / 30))].map((_, m) =>
                start.add(m, 'month').format('MMM')
            )
            console.log(fullMonths, Math.floor(diff / 30))
            for (const timestamp in events[users[0]]) {
                if (
                    Number(timestamp) < start_date ||
                    Number(timestamp) > end_date
                )
                    continue

                const monthShort = dayjs(Number(timestamp)).format('MMM')
                console.log(monthShort)
                const month = fullMonths.includes(monthShort)
                    ? monthShort
                    : `${monthShort} - Partial`
                usage[month] = usage[month] || 0
                usage[month] +=
                    events[users[0]][timestamp].pt +
                    events[users[0]][timestamp].ct
            }
            // fill any gaps in the months with 0
            const months = {}
            for (let c = 0; c <= diff; c++) {
                const monthShort = start.add(c, 'day').format('MMM')
                const month = fullMonths.includes(monthShort)
                    ? monthShort
                    : `${monthShort} - Partial`
                months[month] = usage[month] || 0
            }
            Object.entries(months).forEach(([month, count]) => {
                chart.data.labels.push(month)
                chart.data.datasets[0].data.push(count)
            })
        } else {
            // show by year (but if its like 2021 and then 14 months since 2021 then do like ["2021", "2022 - Partial"])
            const usage = {}
            const fullYears = [...Array(Math.floor(diff / 365))].map((_, y) =>
                start.add(y, 'year').format('YYYY')
            )

            for (const timestamp in events[users[0]]) {
                if (
                    start_date > Number(timestamp) ||
                    end_date < Number(timestamp)
                )
                    continue
                const yearShort = dayjs(Number(timestamp)).format('YYYY')
                const year = fullYears.includes(yearShort)
                    ? yearShort
                    : `${yearShort} - Partial`
                usage[year] = usage[year] || 0
                usage[year] +=
                    events[users[0]][timestamp].pt +
                    events[users[0]][timestamp].ct
            }
            // fill any gaps in the years with 0
            const years = {}
            for (let c = 0; c <= diff; c++) {
                const yearShort = start.add(c, 'day').format('YYYY')
                const year = fullYears.includes(yearShort)
                    ? yearShort
                    : `${yearShort} - Partial`
                years[year] = usage[year] || 0
            }
            Object.entries(years).forEach(([year, count]) => {
                chart.data.labels.push(year)
                chart.data.datasets[0].data.push(count)
            })
        }
    } else {
        console.log('multiple users')
        const usage = {}
        for (const userId in events) {
            if (users && !users.includes(userId)) continue
            const userName = userMap[userId] || userId
            usage[userName] = 0
            for (const timestamp in events[userId]) {
                if (timestamp >= start_date && timestamp <= end_date) {
                    const event = events[userId][timestamp]
                    usage[userName] += event.pt + event.ct
                }
            }
        }

        Object.entries(usage).forEach(([userName, count]) => {
            chart.data.labels.push(userName.split(' ')[0])
            chart.data.datasets[0].data.push(count)
        })
    }

    const start_fmt = dayjs(start_date).format('MMM D')
    const end_fmt = dayjs(end_date).format('MMM D')
    const fmt = start_fmt === end_fmt ? start_fmt : `${start_fmt} - ${end_fmt}`
    return updateCardData({
        ...baseCard(),
        body: [
            {
                type: 'TextBlock',
                text: `Token usage (${fmt})`,
                wrap: true,
                weight: 'Bolder',
                horizontalAlignment: 'Center',
            },
            {
                type: 'Image',
                url: `https://quickchart.io/chart?v=4&c=${encodeURIComponent(
                    JSON.stringify(chart) + ';'
                )}`,
            },
        ],
    })
}
