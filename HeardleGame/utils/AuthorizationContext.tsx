'use client'
import React, { createContext } from 'react'

type Props = {
    accessToken: string
}

type AuthorizationContextState = {
    accessToken: string
}

const AuthorizationContext = createContext<AuthorizationContextState>({
    accessToken: '',
})

export default function AuthorizationContextProvider({
    accessToken,
    children,
}: React.PropsWithChildren<Props>) {
    return (
        <AuthorizationContext.Provider value={{ accessToken }}>
            {children}
        </AuthorizationContext.Provider>
    )
}

export function useAuthorizationContext() {
    return React.useContext(AuthorizationContext)
}

export function useAccessToken() {
    return React.useContext(AuthorizationContext).accessToken
}
