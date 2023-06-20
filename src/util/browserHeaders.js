export const cookieJar = {
    'session-id': '261-8807603-2928754',
    'session-id-time': '2082787201l',
    'i18n-prefs': 'GBP',
    'ubid-acbuk': '259-3762747-4171456',
    'session-token':
        '"jaDaKWpOBV1OkV2Gc8QObc1rwbtWPmigcVUUpTzma2aODpoXpiQkmy+Opzse3Vx58SWjNiOCIGJ2/+MS8Vs4OlujLhlRx8Nr3xRaHcxljtHKa6QW4x5KTfQLIAugf/mGUOUaJmxJ4ZUReOjS2ZthTI91gx6mltIWKZqnGLI7oA/fQflkmXqKWer5hN98lW5ynQNh4VZx54izOVZUEl+NgAr8ZYNL4cytDwkRZIqVoIw',
    'csm-hit':
        'tb:94XVR3FJ3A26XGTAZSF0+s-94XVR3FJ3A26XGTAZSF0|1687286004345&t:1687286004345&adb:adblk_no',
    mkt: 'en-GB',
    'lc-main': 'en_GB',
    'lc-acbuk': 'en_GB',
}

export const browserHeaders = url => ({
    accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-encoding': 'gzip',
    'accept-language': 'en-US,en;q=0.9,nl;q=0.8',
    'cache-control': 'max-age=0',
    connection: 'Keep-Alive',
    cookie: Object.entries(cookieJar)
        .map(([k, v]) => `${k}=${v}`)
        .join('; '),
    'sec-ch-ua':
        '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    host: url.match(/https?:\/\/([^\/]+)/)[1],
})
