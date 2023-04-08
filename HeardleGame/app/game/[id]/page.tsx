import authorizePage from '../../../utils/authorizePage'
import Game from '../Game'

const random = async ({ params }: { params: { id: string } }) => {
    const access_token = await authorizePage()

    return (
        <Game accessToken={access_token} artistId={params.id} />
    )
}

export default random