import type { NextApiRequest, NextApiResponse } from 'next'
import { setCookie } from '../../utils/cookies'
import querystring from 'querystring'

const SPOTIFY_CLIENT_ID: string = process.env.SPOTIFY_CLIENT_ID ?? ''
const STATE_KEY: string = process.env.STATE_KEY ?? ''
const REDIRECT_URI: string = process.env.REDIRECT_URI ?? ''

var generateRandomString = function (length: number) {
    var text = ''
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    
	for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
	}
	return text
}

export default function GET(req: NextApiRequest, res: NextApiResponse) {
    console.log('Hit login endpoint')
	var state = generateRandomString(16)
	setCookie(res, STATE_KEY, state)

	// your application requests authorization
	var scope =
		'user-read-private user-read-email app-remote-control streaming user-read-playback-state user-modify-playback-state'
	res.redirect(
		'https://accounts.spotify.com/authorize?' +
			querystring.stringify({
				response_type: 'code',
				client_id: SPOTIFY_CLIENT_ID,
				scope: scope,
				redirect_uri: REDIRECT_URI,
				state: state
			})
	)
}