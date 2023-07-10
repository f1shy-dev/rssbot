/* export const logTokenEvent = async (
    userId,
    userName,
    promptTokens,
    completionTokens,
    eventTypes
) => {
    const event_db = (await MAINKV.get(`tokenlog`, { type: 'json' })) || {}
    if (!event_db.userMap) event_db.userMap = {}
    if (!event_db.userMap[userId]) event_db.userMap[userId] = userName
    if (!event_db.events) event_db.events = {}
    if (!event_db.events[userId]) event_db.events[userId] = {}

    event_db.events[userId][Date.now()] = {
        et: eventTypes.map(e => eventDB[e] || e),
        pt: promptTokens,
        ct: completionTokens,
    }
    await MAINKV.put(`tokenlog`, JSON.stringify(event_db))
}
*/

import { baseCard } from '../../util/adaptivecard'
import { cardData } from '../../util/botData'

export const aiusage = async ({
    msg,
    args,
    mArgs,
    user,
    config,
    replyMessage,
    cmdData,
    event,
}) => {
    const event_db = (await MAINKV.get(`tokenlog`, { type: 'json' })) || {}
    const userMap = event_db.userMap || {}
    const events = event_db.events || {}

    const timestamps = Object.values(events)
        .map(Object.keys)
        .flat()
        .map(Number)

    const min = Math.min(...timestamps) || Date.now()
    const max = Math.max(...timestamps) || Date.now()

    let submitData = {
        card_id: 'aiusage',
    }
    if (!cmdData['alldata_userids'].includes(user.id)) {
        submitData.users = [user.id]
    }

    return cardData({
        ...baseCard(),
        body: [
            {
                type: 'TextBlock',
                text: 'Token usage',
                wrap: true,
                weight: 'Bolder',
                horizontalAlignment: 'Left',
                size: 'Large',
            },
            {
                type: 'ColumnSet',
                columns: [
                    {
                        type: 'Column',
                        items: [
                            {
                                type: 'Input.Date',
                                label: 'Start Date',
                                id: 'start_date',
                                min: new Date(min).toISOString().split('T')[0],
                                max: new Date(max).toISOString().split('T')[0],
                            },
                        ],
                    },
                    {
                        type: 'Column',
                        items: [
                            {
                                type: 'Input.Date',
                                label: 'End Date',
                                id: 'end_date',
                                min: new Date(min).toISOString().split('T')[0],
                                max: new Date(max).toISOString().split('T')[0],
                            },
                        ],
                    },
                ],
            },
            cmdData['alldata_userids'].includes(user.id)
                ? {
                      type: 'Input.ChoiceSet',
                      choices: Object.entries(userMap).map(
                          ([userId, userName]) => ({
                              title: userName.split(' ')[0],
                              value: userId,
                          })
                      ),
                      placeholder: 'Pick one or more users',
                      id: 'users',
                      label: 'Users to include',
                      isMultiSelect: true,
                      style: 'compact',
                  }
                : {
                      type: 'TextBlock',
                      text: "You'll only be able to see your own usage.",
                  },
        ],
        actions: [
            {
                type: 'Action.Submit',
                title: 'Load chart',
                data: submitData,
            },
        ],
    })
}
