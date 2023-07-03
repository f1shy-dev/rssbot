import { scheduleCardForPeriod } from '../../../shared/anime/schedule'
import { cardData, errorData } from '../../../util/botData'

export const schedule = async ({ msg, args, mArgs, user, config }) => {
    console.log(new Date())
    let response = await scheduleCardForPeriod(
        Date.now(),
        new Date().setHours(24, 0, 0, 0),
        false,
        true
    )
    if (response === 0) {
        response = await scheduleCardForPeriod(
            new Date().setHours(24, 0, 0, 0),
            new Date().setHours(48, 0, 0, 0),
            true,
            true
        )
    }

    if (response === 0 || response === null) {
        return errorData(
            'An error occured while fetching the schedule. Please try again later.'
        )
    }
    console.log(response)

    return cardData(response)
}
