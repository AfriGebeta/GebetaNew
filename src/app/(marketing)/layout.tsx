import Navbar from "@/app/(marketing)/Navbar";
import Footer from "@/app/(marketing)/Footer";
import {Suspense} from "react";
import Loading from "./loading"


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Suspense fallback={<Loading/>}>
            <div
                className="w-full antialiased pt-32 flex flex-col min-h-screen dark:bg-[#05050a]"
            >
                <Navbar/>
                <div className="flex-1">

                    {children}
                </div>
                <Footer/>
            </div>
        </Suspense>
    );
}
