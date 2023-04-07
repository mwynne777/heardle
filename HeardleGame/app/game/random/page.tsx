import authorizePage from '../../../utils/authorizePage'
import Game from '../Game'

export type Song = {
	artist: string
	id: string
	img: string
	lengthMillis: number
	title: string
	uri: string
}

const random = async () => {
    const access_token = await authorizePage()

    return (
        <Game accessToken={access_token}/>
    )
}

export default random