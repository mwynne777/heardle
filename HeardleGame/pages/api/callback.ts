import type { NextApiRequest, NextApiResponse } from 'next'
import querystring from 'querystring'
import { setCookie } from '../../utils/cookies'
import mysql from 'mysql2'

const SPOTIFY_CLIENT_ID: string = process.env.SPOTIFY_CLIENT_ID ?? ''
const SPOTIFY_CLIENT_SECRET: string = process.env.SPOTIFY_CLIENT_SECRET ?? ''
const REDIRECT_URI: string = process.env.REDIRECT_URI ?? ''
const CLIENT_URL: string = process.env.CLIENT_URI ?? ''
const STATE_KEY: string = process.env.STATE_KEY ?? ''
const DATABASE_URL: string = process.env.DATABASE_URL ?? ''
const USER_COOKIE: string = process.env.USER_COOKIE ?? ''

const connection = mysql.createConnection(DATABASE_URL);
connection.connect()

export default async(
	req: NextApiRequest,
	res: NextApiResponse
) => {
    var code = req.query.code || null
	var state = req.query.state || null
	var storedState = req.cookies ? req.cookies[STATE_KEY] : null

	if (state === null || state !== storedState) {
		res.redirect(
			`${CLIENT_URL}/#` +
				querystring.stringify({
					error: 'state_mismatch'
				})
		)
	} else {
		res.removeHeader(STATE_KEY)

		const body = { code: code as string, redirect_uri: REDIRECT_URI, grant_type: 'authorization_code' }
		const formBody = Object.keys(body).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(body[key as keyof typeof body])).join('&');


		const tokenResponse = await fetch(
			'https://accounts.spotify.com/api/token',
			{
				method: 'POST',
				body: formBody,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Authorization':
						'Basic ' +
						new Buffer(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
				}
			}
		)

		if (!tokenResponse.ok) {
			res.redirect(
				`${CLIENT_URL}/#` +
					querystring.stringify({
						error: 'invalid_token'
					})
			)
		}

		const tokenData = await tokenResponse.json()

		const userResponse = await fetch(
			'https://api.spotify.com/v1/me',
			{ 
				headers: { Authorization: 'Bearer ' + tokenData.access_token }
			}
		)

		const user = await userResponse.json()

		const isoDate = new Date()
		isoDate.setTime(isoDate.getTime() + (59*60*1000)) 
		const mySQLDateString = isoDate.toJSON().slice(0, 19).replace('T', ' ');

		connection.query(
			'INSERT INTO users (id, email, access_token, access_token_expires_at, refresh_token) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE email = VALUES(email), access_token = VALUES(access_token), access_token_expires_at = VALUES(access_token_expires_at), refresh_token = VALUES(refresh_token)',
			[user.id, user.email, tokenData.access_token, mySQLDateString, tokenData.refresh_token],
			(err, result, fields) => {
				console.log('err: ', err)
				console.log('result: ', result)
				console.log('fields: ', fields)
			}
			)

		setCookie(res, USER_COOKIE, user.id, { path: '/' })
		res.redirect(`${CLIENT_URL}/game`)
	}
}