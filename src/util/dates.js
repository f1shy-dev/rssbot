export const dateToDay = date => {
    const c = date
        .toLocaleString('en', { day: 'numeric', month: 'long' })
        .split(' ')
        .reverse()
    return `${c[0]}${
        Number(c[0]) >= 11 && Number(c[0]) <= 13
            ? 'th'
            : ['st', 'nd', 'rd'][(Number(c[0]) % 10) - 1] || 'th'
    } of ${c[1]}`
}
