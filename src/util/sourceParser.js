import { parse } from 'parse5'
import { queryAll, query, hasAttribute, getAttribute } from '@parse5/tools'

function getNodeTextContent(node, filter) {
    if (!node) return ''
    if (filter && typeof filter === 'function' && !filter(node)) return ''
    let text = ''
    if (node.childNodes)
        node.childNodes.forEach(childNode => {
            text += ' ' + getNodeTextContent(childNode, filter)
        })

    if (node.value) text += node.value

    return text.trim()
}

export const hasClassOrID = (node, classes) => {
    if (!(node && node.attrs)) return false
    const classAttribute = node.attrs.find(attr => attr.name === 'class')
    const idAttribute = node.attrs.find(attr => attr.name === 'id')
    if (!classAttribute && !idAttribute) return false

    const has = [classes]
        .flat()
        .every(
            c =>
                (classAttribute &&
                    classAttribute.value.includes(c.substr(1))) ||
                (idAttribute && idAttribute.value.includes(c.substr(1)))
        )

    return has
}

const hcid = c => node => hasClassOrID(node, c)

export const getTextFromURL = async url => {
    console.log(`[source getText] ${url}`)
    const response = await fetch(url, {
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        },
    })
    if (!response.ok) return null
    const htmlString = await response.text()
    const document = parse(htmlString)
    const root =
        query(document, node => {
            if (node.tagName && node.tagName === 'main') return true

            return hasClassOrID(
                node,
                [
                    'article',
                    'article-body',
                    'main',
                    'content-main',
                    'page-content',
                    'post-content',
                ]
                    .map(i => [`#${i}`, `.${i}`])
                    .flat()
            )
        }) || document

    const text = getNodeTextContent(root, node => {
        const deny = [
            'nav',
            'aside',
            'footer',
            'script',
            'style',
            'link',
            'meta',
            'noscript',
            'iframe',
            'header',
            'video',
            'audio',
        ]
        if (node.tagName && deny.includes(node.tagName)) return false
        if (
            node.attrs &&
            (hasAttribute(node, 'hidden') || hasAttribute(node, 'aria-hidden'))
        )
            return false

        return true
    })
    return text
}
export const getSourcesFromDDG = async query => {
    console.log(`[source search] ${query}`)
    const gres = await fetch('https://duckduckgo.com/html/?q=' + query, {
        headers: {
            'User-Agent':
                //latest chrome
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
            Cookie: 'mkt=en-US; mkt1=en-US',
        },
    })
    if (!gres.ok) return null

    return getSourcesFromDDGWebResult(await gres.text())
}

const getSourcesFromDDGWebResult = htmlString => {
    const sources = []
    const document = parse(htmlString)

    const zciResults = queryAll(document, hcid('.zci__result'))
    for (element of zciResults) {
        const text = queryAll(element, n => n.nodeName == '#text')
        const resultLink = query(element, n => n.tagName === 'a')
        const zciText = Array.from(text)
            .flat()
            .map(getNodeTextContent)
            .join('')
            .trim()

        const zciLink = getAttribute(resultLink, 'href')
        sources.push({
            url: zciLink,
            full: zciText,
            brief: '',
        })
    }

    const webResults = queryAll(document, hcid(['.result', '.results_links']))
    for (element of webResults) {
        const resultSnippet = query(element, hcid('.result__snippet'))
        const resultLink = query(element, n => n.tagName === 'a')
        const resultText = getNodeTextContent(resultSnippet)
        let resultUrl = getAttribute(resultLink, 'href')
        if (resultUrl.startsWith('//duckduckgo.com/l/')) {
            resultUrl = decodeURIComponent(
                resultUrl.split('uddg=')[1].split('&rut=')[0]
            ).trim()
        }
        sources.push({
            url: resultUrl,
            brief: resultText,
        })
    }

    return sources
}
