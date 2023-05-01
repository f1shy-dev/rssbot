import { textData } from '../util/botData'
import { renderMath } from '../util/renderMath'
// import { create, all } from 'mathjs/'
import {
    create
} from 'mathjs'

import { all as numberAll } from 'mathjs/number'
import { unitDependencies } from 'mathjs'
import { toDependencies } from 'mathjs'
import { UnitDependencies } from 'mathjs'

export const math = async ({
    msg,
    args,
    mArgs,
    user,
    config,
    msgData,
    mentionToken,
    replyMessage,
}) => {
    const mathjs = create()
    mathjs.import(numberAll)
    mathjs.import(unitDependencies, { override: true })
    mathjs.import(toDependencies, { override: true })
    mathjs.import(UnitDependencies, { override: true })
    const { simplify, evaluate } = mathjs

    // /math --render -a 1 eval <math> (where -a can be any variable, so like -x and it sets it)
    // /math --render simplify <math>

    // <math> can include newlines, and you will do whatever to each line separately

    if (args.length == 0) {
        return textData(
            `<b>Math command</b><br>Render math equations and do math operations.`
        )
    }

    const doSlice = mArgs.render && !['eval', 'simplify'].includes(mArgs._[0])

    const mode = doSlice ? mArgs.render : mArgs._[0]
    const math = mArgs._.slice(doSlice ? 0 : 1).join(' ').split('\n')
    console.log('math', math)

    if (mode == 'eval') {
        // const math = mArgs._.slice(doSlice ? 0 : 1).join(' ').split('\n')
        const vars = {}
        for (let key in mArgs) {
            if (key != '_' && key != 'render') {
                vars[key] = mArgs[key]
            }
        }

        let text = '<b>🧮 Math Evaluator</b><br>'
        let res = []
        for (let i = 0; i < math.length; i++) {
            const result = evaluate(math[i], vars)
            mArgs.render ? res.push(`{{{${result.toTex()}}}}`) : res.push(result.toString())
        }
        text += res.join('<br>')
        console.log('gothere')

        return textData(mArgs.render ? await renderMath(text) : text)

    }

    if (mode == 'simplify') {
        // const math = [...(doSlice ? mArgs.render : []), ...mArgs._.slice(doSlice ? 0 : 1)].join(' ').split('\n')

        let text = '<b>🧮 Math Simplification</b><br>'
        let res = []
        for (let i = 0; i < math.length; i++) {
            const result = simplify(math[i])
            mArgs.render ? res.push(`{{{${result.toTex()}}}}`) : res.push(result.toString())
        }
        text += res.join('<br>')

        return textData(mArgs.render ? await renderMath(text) : text)
    }

    return textData(`<b>😬 Whoops...</b><br>Could not find a mode matching your search. <br><br>📝 Run <code>/math eval [math]</code> to evaluate math.<br>📝 Run <code>/math simplify [math]</code> to simplify math.`)
}
