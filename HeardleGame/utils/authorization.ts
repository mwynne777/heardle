import mysql from 'mysql2/promise'

const DATABASE_URL: string = process.env.DATABASE_URL ?? ''
const SPOTIFY_CLIENT_ID: string = process.env.SPOTIFY_CLIENT_ID ?? ''
const SPOTIFY_CLIENT_SECRET: string = process.env.SPOTIFY_CLIENT_SECRET ?? ''

type Authorization =
    | {
          isAuthorized: true
          access_token: string
      }
    | {
          isAuthorized: false
      }

type User = {
    id: string
    email: string
    access_token: string | null
    access_token_expires_at: Date | null
    refresh_token: string
}

const isUserAuthorized = async (
    id: string | null | undefined
): Promise<Authorization> => {
    if (id === null || id === undefined || id === '')
        return { isAuthorized: false }

    const connection = await mysql.createConnection(DATABASE_URL)
    const dbresponse = await connection.execute(
        'SELECT * FROM users WHERE id = ? LIMIT 1',
        [id]
    )
    const rows = dbresponse[0] as User[]

    const now = new Date()
    var newDateObj = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
    if (
        rows.length > 0 &&
        rows[0].access_token !== null &&
        rows[0].access_token_expires_at !== null &&
        new Date(rows[0].access_token_expires_at) > newDateObj
    ) {
        console.log('Pulled your access token from the db, looks current')
        return { isAuthorized: true, access_token: rows[0].access_token }
    }

    if (rows.length > 0 && rows[0].refresh_token !== null) {
        const body = {
            grant_type: 'refresh_token',
            refresh_token: rows[0].refresh_token,
        }
        const formBody = Object.keys(body)
            .map(
                (key) =>
                    encodeURIComponent(key) +
                    '=' +
                    encodeURIComponent(body[key as keyof typeof body])
            )
            .join('&')

        const tokenResponse = await fetch(
            'https://accounts.spotify.com/api/token',
            {
                method: 'POST',
                body: formBody,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization:
                        'Basic ' +
                        new Buffer(
                            SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET
                        ).toString('base64'),
                },
            }
        )

        if (tokenResponse.ok) {
            const { access_token } = await tokenResponse.json()
            const access_token_expires_at = new Date()
                .toJSON()
                .slice(0, 19)
                .replace('T', ' ')
            await connection.execute(
                'UPDATE users SET access_token = ?, access_token_expires_at = ? WHERE id = ?',
                [access_token, access_token_expires_at, id]
            )
            console.log('Requested a new access token using your refresh token')
            console.log(
                'Are the old and new access tokens the same? ',
                access_token === rows[0].access_token
            )
            return { isAuthorized: true, access_token }
        }
    }

    return { isAuthorized: false }
}

export { isUserAuthorized }
