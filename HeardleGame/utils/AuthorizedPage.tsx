import React from 'react'
import AuthorizationContextProvider from './AuthorizationContext'
import authorizePage from './authorizePage'

export default async function AuthorizedPage({
    children,
}: React.PropsWithChildren<{}>) {
    const accessToken = await authorizePage()

    return (
        <AuthorizationContextProvider accessToken={accessToken}>
            {children}
        </AuthorizationContextProvider>
    )
}
