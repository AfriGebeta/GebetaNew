import Navbar from "@/app/(marketing)/Navbar";
import Footer from "@/app/(marketing)/Footer";


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div
            className="w-full antialiased pt-20 flex flex-col min-h-screen"
        >
            <Navbar/>
            <div className="flex-1">

                {children}
            </div>
            <Footer/>
        </div>
    );
}
