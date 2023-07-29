import jwt from '@tsndr/cloudflare-worker-jwt'
import { error } from 'itty-router'

export const checkAuth = async res => {
    if (!res.headers.get('authorization')) return error(401)
    const auth = res.headers.get('authorization').split(' ')[1]
    if (((await MAINKV.get('SKIPAUTH_UKEYS')) || '').split(',').includes(auth))
        return { valid: true, userID: auth }
    const token = await jwt.verify(auth, JWT_SECRET)
    if (!token) return error(401)
    const decrypted = atob(auth.split('.')[1]).toString()
    const { userID, cd, key } = JSON.parse(decrypted)
    console.log(userID, cd, key)

    return {
        userID,
        cd,
        key,
        valid:
            userID &&
            ((await MAINKV.get('USERKEYS')) || USERKEYS)
                .split(',')
                .includes(userID),
    }
}
