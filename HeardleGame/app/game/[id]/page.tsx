import AuthorizedPage from '../../../utils/AuthorizedPage'
import Game from '../Game'

const random = ({ params }: { params: { id: string } }) => {
    return (
        <>
            {/* @ts-expect-error Server Component */}
            <AuthorizedPage>
                <Game artistId={params.id} />
            </AuthorizedPage>
        </>
    )
}

export default random
