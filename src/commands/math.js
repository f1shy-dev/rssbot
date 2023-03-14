import { textData } from '../util/botData'
import { renderMath } from '../util/renderMath'

export const math = async ({ msg, args, user, config, msgData, mentionToken, replyMessage }) => {
    // fetch svg from math.vercel.app
    // const s = `https://math.vercel.app/?from=${encodeURIComponent(m)}`
    // const r = await fetch(s)
    // let source = await r.text()
    // console.log(source)

    // if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    //     source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    // }
    // if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
    //     source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    // }

    // //add xml declaration
    // source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    // //convert svg source to URI data scheme.
    // var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

    //fetch image and get height/width
    // const url = `https://latex.codecogs.com/gif.json?${encodeURIComponent(args.join(" "))}`
    // const i = await fetch(url)
    // const data = await i.json()

    // const imgURL = `https://latex.codecogs.com/png.image?${encodeURIComponent(args.join(" "))}`
    // let str = `<b>Image Test  </b><span style="background-color: rgb(254,254,254); width: ${data.latex.width + 4}px; height: ${data.latex.height + 4}px; display:inline-block;"><img style="width: ${data.latex.width}px; height: ${data.latex.height}px;" src="${imgURL}" /></span>`
    // console.log(str)
    return textData(`<b>Math Rendering Test</b><br>${await renderMath(args.join(" "))}`)
}