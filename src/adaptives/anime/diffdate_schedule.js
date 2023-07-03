import { scheduleCardForPeriod } from '../../shared/anime/schedule'
import { errorData } from '../../util/botData'
import { updateCardData } from '../../util/botData'

export const diffdate_schedule = async ({ user, outputs }) => {
    if (!outputs || !outputs.scheduleDate) return ignoreData()
    console.log(outputs)
    let response = await scheduleCardForPeriod(
        new Date(outputs.scheduleDate).setHours(0, 0, 0, 0),
        new Date(outputs.scheduleDate).setHours(24, 0, 0, 0),
        false,
        false
    )

    if (response === 0 || response === null) {
        return errorData(
            'An error occured while fetching the schedule. Please try again later.'
        )
    }

    return updateCardData(response)
}
