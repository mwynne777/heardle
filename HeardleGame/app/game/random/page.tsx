import AuthorizedPage from '../../../utils/AuthorizedPage'
import Game from '../Game'

const random = async () => {
    return (
        <>
            {/* @ts-expect-error Server Component */}
            <AuthorizedPage>
                <Game />
            </AuthorizedPage>
        </>
    )
}

export default random
