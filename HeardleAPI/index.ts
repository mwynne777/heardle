/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express') // Express web server framework
var request = require('request') // "Request" library
var cors = require('cors')
var querystring = require('querystring')
var cookieParser = require('cookie-parser')
var fs = require('fs')

require('dotenv').config()
const SPOTIFY_CLIENT_ID: string = process.env.SPOTIFY_CLIENT_ID ?? ''
const SPOTIFY_CLIENT_SECRET: string = process.env.SPOTIFY_CLIENT_SECRET ?? ''

const redirect_uri = 'http://localhost:3002/callback' // Your redirect uri
const client_url = 'http://localhost:3001'

let songs: string[] = []
try {
	var lineReader = require('readline').createInterface({
		input: require('fs').createReadStream('topTenSongs.txt')
	})

	lineReader.on('line', function (line: string) {
		songs.push(line)
	})
} catch (err) {
	console.error(err)
}

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length: number) {
	var text = ''
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length))
	}
	return text
}

var stateKey = 'spotify_auth_state'

var app = express()

app.use(express.static(__dirname + '/public'))
	.use(cors())
	.use(cookieParser())

app.get('/login', function (_req: any, res: any) {
	console.log('Hit login endpoint')
	var state = generateRandomString(16)
	res.cookie(stateKey, state)

	// your application requests authorization
	var scope =
		'user-read-private user-read-email app-remote-control streaming user-read-playback-state user-modify-playback-state'
	res.redirect(
		'https://accounts.spotify.com/authorize?' +
			querystring.stringify({
				response_type: 'code',
				client_id: SPOTIFY_CLIENT_ID,
				scope: scope,
				redirect_uri: redirect_uri,
				state: state
			})
	)
})

app.get('/callback', function (req: any, res: any) {
	// your application requests refresh and access tokens
	// after checking the state parameter

	var code = req.query.code || null
	var state = req.query.state || null
	var storedState = req.cookies ? req.cookies[stateKey] : null

	if (state === null || state !== storedState) {
		res.redirect(
			`${client_url}/#` +
				querystring.stringify({
					error: 'state_mismatch'
				})
		)
	} else {
		res.clearCookie(stateKey)
		var authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code: code,
				redirect_uri: redirect_uri,
				grant_type: 'authorization_code'
			},
			headers: {
				Authorization:
					'Basic ' +
					new Buffer(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
			},
			json: true
		}

		request.post(authOptions, function (error: any, response: any, body: any) {
			if (!error && response.statusCode === 200) {
				var access_token = body.access_token,
					refresh_token = body.refresh_token

				var options = {
					url: 'https://api.spotify.com/v1/me',
					headers: { Authorization: 'Bearer ' + access_token },
					json: true
				}

				// use the access token to access the Spotify Web API
				request.get(options, function (error: any, response: any, body: any) {
					console.log(body)
				})

				// we can also pass the token to the browser to make requests from there
				res.redirect(
					`${client_url}/game/#` +
						querystring.stringify({
							access_token: access_token,
							refresh_token: refresh_token
						})
				)
			} else {
				res.redirect(
					`${client_url}/#` +
						querystring.stringify({
							error: 'invalid_token'
						})
				)
			}
		})
	}
})

app.get('/refresh_token', function (req: any, res: any) {
	// requesting access token from refresh token
	var refresh_token = req.query.refresh_token
	var authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		headers: {
			Authorization:
				'Basic ' +
				new Buffer(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
		},
		form: {
			grant_type: 'refresh_token',
			refresh_token: refresh_token
		},
		json: true
	}

	request.post(authOptions, function (error: any, response: any, body: any) {
		if (!error && response.statusCode === 200) {
			var access_token = body.access_token
			res.send({
				access_token: access_token
			})
		}
	})
})

app.get('/getRandomSong', function (req: any, res: any) {
	const numberOfSongs = songs.length
	const randomIndex = Math.floor(Math.random() * numberOfSongs)
	console.log('Random song choice: ', songs[randomIndex])
	res.json({ song: songs[randomIndex] })
})

app.get('/getAutocomplete', function (req: any, res: any) {
	console.log(req.query.prefix)
	const { prefix } = req.query
	const autocompleteOptions = songs.filter((s) => s.toLowerCase().includes(prefix.toLowerCase()))
	res.json({ autoCompleteOptions: autocompleteOptions })
})

console.log('Listening on 3002')
app.listen(3002)
