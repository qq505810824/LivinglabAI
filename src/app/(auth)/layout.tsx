import Link from 'next/link'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col bg-tea-50">
            <header className="flex h-16 items-center justify-center border-b border-tea-100 bg-white/50 backdrop-blur-md px-4">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold text-tea-700 hover:text-tea-600 transition-colors">
                    <img src="/icon.png" className="h-8 w-8" alt="Logo" />
                    <span className="tracking-wide">TalentSyncAI</span>
                </Link>
            </header>

            <main className="flex-1 flex items-center justify-center p-4">
                {children}
            </main>

            <footer className="py-6 text-center text-sm text-earth-500">
                <p>© {new Date().getFullYear()} TalentSyncAI. All rights reserved.</p>
            </footer>
        </div>
    )
}
