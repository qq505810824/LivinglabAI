import { Header } from "@/components/layout/Header";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="h-full">{children}</main>
        </div>
    );
}
