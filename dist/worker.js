!(function(e) {
    var t = {}
    function r(n) {
        if (t[n]) return t[n].exports
        var o = (t[n] = { i: n, l: !1, exports: {} })
        return e[n].call(o.exports, o, o.exports, r), (o.l = !0), o.exports
    }
    ;(r.m = e),
        (r.c = t),
        (r.d = function(e, t, n) {
            r.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: n })
        }),
        (r.r = function(e) {
            'undefined' != typeof Symbol &&
                Symbol.toStringTag &&
                Object.defineProperty(e, Symbol.toStringTag, {
                    value: 'Module',
                }),
                Object.defineProperty(e, '__esModule', { value: !0 })
        }),
        (r.t = function(e, t) {
            if ((1 & t && (e = r(e)), 8 & t)) return e
            if (4 & t && 'object' == typeof e && e && e.__esModule) return e
            var n = Object.create(null)
            if (
                (r.r(n),
                Object.defineProperty(n, 'default', {
                    enumerable: !0,
                    value: e,
                }),
                2 & t && 'string' != typeof e)
            )
                for (var o in e)
                    r.d(
                        n,
                        o,
                        function(t) {
                            return e[t]
                        }.bind(null, o)
                    )
            return n
        }),
        (r.n = function(e) {
            var t =
                e && e.__esModule
                    ? function() {
                          return e.default
                      }
                    : function() {
                          return e
                      }
            return r.d(t, 'a', t), t
        }),
        (r.o = function(e, t) {
            return Object.prototype.hasOwnProperty.call(e, t)
        }),
        (r.p = ''),
        r((r.s = 1))
})([
    function(e, t) {
        e.exports = {
            Router: ({ base: e = '', routes: t = [] } = {}) => ({
                __proto__: new Proxy(
                    {},
                    {
                        get: (r, n, o) => (r, ...s) =>
                            t.push([
                                n.toUpperCase(),
                                RegExp(
                                    `^${(e + r)
                                        .replace(/(\/?)\*/g, '($1.*)?')
                                        .replace(/\/$/, '')
                                        .replace(
                                            /:(\w+)(\?)?(\.)?/g,
                                            '$2(?<$1>[^/]+)$2$3'
                                        )
                                        .replace(/\.(?=[\w(])/, '\\.')
                                        .replace(
                                            /\)\.\?\(([^\[]+)\[\^/g,
                                            '?)\\.?($1(?<=\\.)[^\\.'
                                        )}/*$`
                                ),
                                s,
                            ]) && o,
                    }
                ),
                routes: t,
                async handle(e, ...r) {
                    let n,
                        o,
                        s = new URL(e.url)
                    for (var [a, i, p] of ((e.query = Object.fromEntries(
                        s.searchParams
                    )),
                    t))
                        if (
                            (a === e.method || 'ALL' === a) &&
                            (o = s.pathname.match(i))
                        )
                            for (var u of ((e.params = o.groups), p))
                                if (
                                    void 0 !== (n = await u(e.proxy || e, ...r))
                                )
                                    return n
                },
            }),
        }
    },
    function(e, t, r) {
        'use strict'
        r.r(t)
        var n = r(0)
        const o = e =>
                new Response(
                    `<rss version="2.0"><channel><title>fakeRSS</title><description>fakeRSS</description><language>en</language><item><title>json</title><link>https://fakeRSS.labs/json</link><description>${JSON.stringify(
                        e
                    )}</description><pubDate>Sun, 23 Jan 2022 17:50:24 -0000</pubDate></item></channel></rss>`,
                    { headers: { 'Content-Type': 'application/xml' } }
                ),
            s = e =>
                '<p>' +
                e
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/<b>/g, '<strong>')
                    .replace(/<\/b>/g, '</strong>') +
                '</p>',
            a = e =>
                o({
                    response: s(e),
                    sendResponse: !0,
                    responseType: 'text',
                    status: 'ok',
                }),
            i = e => {
                const t = e.m
                if ('' === t || void 0 === t)
                    return (
                        (r = new Error('CommandMissing')),
                        o({
                            response: s(
                                'An internal error occured while running your command:<br><br>Error Details: ' +
                                    r.message
                            ),
                            sendResponse: !0,
                            responseType: 'text',
                            status: 'error',
                        })
                    )
                var r
                const n = t.split(' ')[0]
                if (!n.startsWith('!'))
                    return o({
                        response: '',
                        sendResponse: !1,
                        status: 'ignore',
                    })
                const i = e => n == '!' + e
                return i('reddit')
                    ? a('Reddit command not implemented yet!')
                    : i('help')
                    ? (e => {
                          const t = {
                                  reddit: 'view posts from reddit',
                                  help: 'show this help menu',
                                  ping: '🏓 pong!',
                              },
                              r =
                                  'List of all commands:<br><br>' +
                                  Object.keys(t)
                                      .map(e => `<b>!${e}</b> - ${t[e]}`)
                                      .join('<br>')
                          return a(r)
                      })()
                    : i('ping')
                    ? a('🏓 Pong!')
                    : ((p = `The command <b>${
                          m.split(' ')[0]
                      }</b> doesn't exist!<br><br>Run <b>!help</b> for a list of commands.`),
                      o({
                          response: s(p),
                          sendResponse: !0,
                          responseType: 'text',
                          status: 'error',
                      }))
                var p
            },
            p = Object(n.Router)()
        p.get('/rssbot/', ({ query: e }) => i(e)),
            p.all('*', () => new Response('404 not found!', { status: 404 })),
            addEventListener('fetch', e => e.respondWith(p.handle(e.request)))
    },
])
