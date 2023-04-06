export const metadata = {
    title: 'Heardle'
}

export default function RootLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <html lang='en'>
            <body>
                {children}
            </body>
        </html>
    )
}