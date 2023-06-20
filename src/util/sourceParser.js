import { parse } from 'parse5'
import { queryAll, query, hasAttribute, getAttribute } from '@parse5/tools'
import { browserHeaders, cookieJar } from './browserHeaders'

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
    let resolved = false
    let tries = 0
    let response = null
    let htmlString = null
    // redirect manually so we can set cookies to make sure some sites dont infinite redirect
    while (!resolved && tries < 8) {
        const parsedURL = new URL(url)
        tries++
        response = await fetch(url, {
            headers: browserHeaders(url),
            redirect: 'manual',
        })
        console.log(`[source getText] ${url} - ${response.status}`)

        if (
            !response ||
            (!response.ok && !(response.status >= 300 && response.status < 400))
        ) {
            console.log(`[source getText] ${url} failed - ${response.status}`)
            resolved = true
            response = null
            return null
        }
        if (response.headers.get('set-cookie')) {
            const cookies = response.headers
                .get('set-cookie')
                .split(',')
                .map(c => c.split(';')[0])
            cookies.forEach(c => (cookieJar[c.split('=')[0]] = c.split('=')[1]))
        }

        if (response.status >= 300 && response.status < 400) {
            url = response.headers.get('location')
            console.log(`[source getText] redirecting to ${url}`)
            if (!url.startsWith('http')) {
                if (url.startsWith('//')) url = parsedURL.protocol + url
                else if (url.startsWith('/')) url = parsedURL.origin + url
                else url = parsedURL.origin + '/' + url
            }
            continue
        }
        // check meta refresh
        const str = await response.text()
        htmlString = str
        const doc = parse(str)
        const meta = query(doc, node => {
            if (node.tagName && node.tagName === 'meta') {
                const equiv = node.attrs.find(
                    attr => attr.name === 'http-equiv'
                )
                if (equiv && equiv.value === 'refresh') return true
            }
            return false
        })
        if (!meta) {
            resolved = true
            continue
        }
        const content = getAttribute(meta, 'content')
        if (!content) {
            resolved = true
            continue
        }
        const match = content.match(/url=(.*)$/)
        if (match) url = match[1]

        // if (!url) continue
        console.log(`[source getText] redirecting to ${url}`)
        if (!url.startsWith('http')) {
            if (url.startsWith('//')) url = parsedURL.protocol + url
            else if (url.startsWith('/')) url = parsedURL.origin + url
            else url = parsedURL.origin + '/' + url
        }

        if (!url) {
            resolved = true
            response = null
            return null
        }
    }

    if (!response || !response.ok) return null
    console.log(`[source getText html] ${url} - ${response.status}`, htmlString)
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
        headers: browserHeaders('https://duckduckgo.com/html/?q=' + query),
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
