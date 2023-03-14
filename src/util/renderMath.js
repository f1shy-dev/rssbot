export const renderMath = async (baseText) => {


    let text = baseText
    // console.log("mathstart", text)
    for (let match of text.matchAll(/{{{(.*?)}}}/g)) {
        // console.log("match_math", match)
        // get the latex equation
        const equation = match[1]

        // fetch the image from codecogs
        const url = `https://latex.codecogs.com/gif.json?${encodeURIComponent(equation)}`
        const i = await fetch(url)
        const data = await i.json()

        // replace the match with the image
        // console.log(JSON.stringify(data, null, 2))
        text = text.replace(match[0],
            `<span style="background-color: rgb(254,254,254); width: ${Number(data.latex.width) + 4}px; height: ${Number(data.latex.height) + 4}px; display:inline-block;">
                <img style="width: ${data.latex.width}px; height: ${data.latex.height}px; display:inline-block;" src="https://latex.codecogs.com/png.image?${encodeURIComponent(equation)}" />
            </span>  `)
    }

    // console.log("mathend", text)
    return `${text}`;
};
