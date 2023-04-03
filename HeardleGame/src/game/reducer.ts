import { Guess } from './Guesses'

const timeIncrements = [1, 2, 4, 7, 11, 16] as const
type Duration = typeof timeIncrements[number]

type Song = {
	artist: string
	id: string
	img: string
	lengthMillis: number
	title: string
	uri: string
}

const initialSong = {
	artist: '',
	id: '',
	img: '',
	lengthMillis: 0,
	title: '',
	uri: ''
}

type GameState = {
	spotifyUri: string
	spotifyDeviceId: string
	isOver: boolean
	isWinningRound: boolean
	duration: Duration
	playing: boolean
	autocompleteOptions: string[]
	answer: Song
	guesses: Guess[]
}

const initialGameState: GameState = {
	spotifyUri: '',
	spotifyDeviceId: '',
	isOver: false,
	isWinningRound: false,
	duration: 1,
	playing: false,
	autocompleteOptions: [],
	answer: initialSong,
	guesses: []
}

type GameAction =
	| {
			type: 'skip'
	  }
	| {
			type: 'guess'
			payload: {
				guess: string
			}
	  }
	| {
			type: 'toggle-play'
			payload:
				| {
						playing: boolean
				  }
				| undefined
	  }
	| {
			type: 'give-up'
	  }
	| {
			type: 'get-new-song'
			payload: {
				answer: Song
			}
	  }
	| {
			type: 'clear-autocomplete'
	  }
	| {
			type: 'get-autocomplete-options'
			payload: {
				options: string[]
			}
	  }
	| {
			type: 'load-player'
			payload: {
				deviceId: string
			}
	  }
	| {
			type: 'restart'
	  }

const getNextDuration = (state: GameState): Duration => {
	const durationIndex = timeIncrements.indexOf(state.duration)
	if (durationIndex >= 0 && durationIndex < 5) {
		return timeIncrements[durationIndex + 1]
	}
	return timeIncrements[timeIncrements.length - 1]
}

const skip = (state: GameState): GameState => {
	return {
		...state,
		isOver: state.guesses.length === 5 ? true : false,
		isWinningRound: false,
		duration: getNextDuration(state),
		guesses: [...state.guesses, { type: 'skip' }]
	}
}

const guess = (state: GameState, action: Extract<GameAction, { type: 'guess' }>): GameState => {
	return {
		...state,
		guesses: [
			...state.guesses,
			{
				type: action.payload.guess === state.answer.id ? 'correct' : 'incorrect',
				song: action.payload.guess
			}
		],
		autocompleteOptions: [],
		duration: getNextDuration(state),
		isOver:
			state.duration === timeIncrements[timeIncrements.length - 1]
				? true
				: action.payload.guess === state.answer.id,
		isWinningRound: action.payload.guess === state.answer.id
	}
}

const reducer = (state: GameState, action: GameAction): GameState => {
	switch (action.type) {
		case 'skip':
			return skip(state)
		case 'guess':
			return guess(state, action)
		case 'toggle-play':
			return {
				...state,
				playing: action.payload ? action.payload.playing : !state.playing
			}
		case 'give-up':
			return {
				...state,
				isOver: true,
				isWinningRound: false,
				playing: false
			}
		case 'get-new-song':
			return {
				...state,
				answer: action.payload.answer
			}
		case 'clear-autocomplete':
			return {
				...state,
				autocompleteOptions: []
			}
		case 'get-autocomplete-options':
			return {
				...state,
				autocompleteOptions: action.payload.options
			}
		case 'load-player':
			return {
				...state,
				spotifyDeviceId: action.payload.deviceId
			}
		case 'restart':
			return initialGameState
		default:
			throw new Error()
	}
}

export default reducer
export { getNextDuration, initialGameState, Song }
