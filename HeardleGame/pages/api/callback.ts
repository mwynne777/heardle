import type { NextApiRequest, NextApiResponse } from 'next'
import querystring from 'querystring'

const SPOTIFY_CLIENT_ID: string = process.env.SPOTIFY_CLIENT_ID ?? ''
const SPOTIFY_CLIENT_SECRET: string = process.env.SPOTIFY_CLIENT_SECRET ?? ''
const REDIRECT_URI: string = process.env.REDIRECT_URI ?? ''
const CLIENT_URL: string = process.env.CLIENT_URI ?? ''
const STATE_KEY: string = process.env.STATE_KEY ?? ''

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

		const body = { code: code, redirect_uri: REDIRECT_URI, grant_type: 'authorization_code' }
		const formBody = Object.keys(body).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(body[key])).join('&');

		var authOptions = {
			method: 'POST',
			body: formBody,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization':
					'Basic ' +
					new Buffer(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
			}
		}

		fetch('https://accounts.spotify.com/api/token', authOptions)
		.then(response => { 
			if (response.ok) return response.json()
			res.redirect(
				`${CLIENT_URL}/#` +
					querystring.stringify({
						error: 'invalid_token'
					})
			)
		})
		.then((data) => {
				var access_token = data.access_token,
					refresh_token = data.refresh_token

				res.redirect(
					`${CLIENT_URL}/game/#` +
						querystring.stringify({
							access_token: access_token,
							refresh_token: refresh_token
						})
				)
		})
	}
}