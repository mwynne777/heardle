import authorizePage from '../../../utils/authorizePage'
import Game from '../Game'

const random = async () => {
    const access_token = await authorizePage()

    return (
        <Game accessToken={access_token}/>
    )
}

export default random