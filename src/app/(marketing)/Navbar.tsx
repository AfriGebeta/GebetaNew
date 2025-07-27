//@ts-nocheck
"use client";
import Image from "next/image";
import Link from "next/link";
import Container from "@/sections/Container";
import {menuItems} from "@/constants";
import {useNavbarLogic} from "@/utils/useNavbarLogic";
import {User2Icon} from "lucide-react";
import {useRouter} from 'nextjs-toploader/app';
import Announcement from "@/app/_component/Announcement";
import {useState} from "react";
import {usePathname} from "next/navigation";

export default function Navbar() {
    const {
        activeMenu,
        isScrolled,
        isMobileMenuOpen,
        activeMobileSubmenu,
        handleMouseEnter,
        handleMouseLeave,
        toggleMobileMenu,
        toggleMobileSubmenu,
        closeMobileMenu,
    } = useNavbarLogic();

    const pathname = usePathname();

    const [showAnnouncement, setShowAnnouncement] = useState(true)

    const router = useRouter()

    return (
        <>
            <Announcement showAnnouncement={showAnnouncement} setShowAnnouncement={setShowAnnouncement} />
        <header
            className={`w-full h-15 flex items-center transition-colors z-50 fixed ${showAnnouncement ? 'top-11' : 'top-0'} ${isScrolled && ' bg-background/80 backdrop-blur-lg border-b border-separator'}`}
        >
            <Container>
                <nav className="flex justify-between items-center py-4">
                    <div className="flex items-center">
                        <Image src="/assets/logo.svg" width={30} height={30} alt="logo" className="mr-2"/>
                        <Link href="/" onClick={closeMobileMenu}
                              className="text-[16px] text-[#2E384E] dark:text-white font-semibold tracking-wider">
                            GebetaMaps
                        </Link>
                    </div>

                    <div className="md:hidden">
                        <button
                            className="text-gray-600 dark:text-white focus:outline-none"
                            onClick={toggleMobileMenu}
                        >
                            {isMobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M4 6h16M4 12h16m-7 6h7"/>
                                </svg>
                            )}
                        </button>
                    </div>

                    <div className="hidden md:flex flex-grow justify-center">
                        <ul className="flex text-[#2E384E] dark:text-white text-[14px] font-medium">
                            {menuItems.map((item, index) => (
                                <li
                                    key={index}
                                    className={`relative px-4 py-2 cursor-pointer hover:text-[#FFA500] ${pathname?.substring(1) === item.title.toLowerCase() ? "text-[#FFA500]": ""} transition-colors duration-200`}
                                    onMouseEnter={() => item.submenu && handleMouseEnter(item.title)}
                                    onMouseLeave={item.submenu && handleMouseLeave}
                                >
                                    <a
                                        className="flex items-center gap-1 cursor-pointer"
                                        onClick={() => router.push(item.link)}
                                    >
                                        {item.title}
                                        {item.submenu && (
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        )}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="hidden md:flex gap-8">
                        <div className="flex items-center gap-[4px]">
                            <Image
                                className="dark:fill-whitesmoke"
                                src="/assets/user.svg"
                                alt="user icon"
                                width={24}
                                height={24}/>
                            <a
                                className="font-medium text-[#222] dark:text-white hover:text-[#FFA500] transition-all duration-400 cursor-pointer"
                                onClick={() => router.push("/auth/signin")}
                            >Sign In</a>
                        </div>
                        <div
                            className="transition-all bg-[#FFA500] hover:bg-[#FFA500]/80 border border-[#FFA500] px-[30px] py-[15px] rounded-[8px] text-white text-[14px] font-bold whitespace-nowrap">
                            <a
                                className="font-bold cursor-pointer"
                                onClick={() => router.push("/auth/register")}
                            >Get Started</a>
                        </div>
                    </div>
                </nav>

                {isMobileMenuOpen && (
                    <div className="xs:hidden bg-white dark:bg-[#05050a] pb-4">
                        <ul className="text-[#2E384E] dark:text-white text-[14px] font-medium">
                            {menuItems.map((item, index) => (
                                <li key={index} className="px-4 py-2">
                                    <div className="flex justify-between items-center"
                                         onClick={() => item?.submenu && toggleMobileSubmenu(item.title)}>
                                        <a onClick={() => {
                                            router.push(item.link)
                                            closeMobileMenu()
                                        }}>
                                            {item.title}
                                        </a>
                                        {item?.submenu && (
                                            <svg
                                                className={`w-4 h-4 dark:stroke-white transform ${activeMobileSubmenu === item.title ? 'rotate-180' : ''}`}
                                                viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        )}
                                    </div>
                                    {item.submenu && activeMobileSubmenu === item.title && (
                                        <ul className="flex flex-col pl-4 mt-2 space-y-2">
                                            {item.submenu.map((subItem, subIndex) => (
                                                <a
                                                    onClick={() => {
                                                        router.push(subItem.link)
                                                        closeMobileMenu()
                                                    }}
                                                    key={subIndex}
                                                    className="text-sm p-2 hover:bg-[#FFF7E8] dark:hover:bg-gray-700 rounded-md"
                                                >
                                                    {subItem.title}
                                                </a>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 space-y-4 px-4">
                            <div className="flex items-center gap-[4px]">
                                <User2Icon className="w-[16px] h-[16px]"/>
                                <a
                                    className="font-medium"
                                    onClick={() => {
                                        router.push("/auth/signin")
                                        closeMobileMenu()
                                    }}
                                >Sign In</a>
                            </div>
                            <div
                                className="w-fit px-[30px] py-[15px] transition-all border border-[#D2C09D] hover:border-[#FFA500] hover:text-[#FFA500] hover:bg-[#FFA500]/20 text-[14px] rounded-[8px]">
                                <a
                                    className="font-bold"
                                    onClick={() => {
                                        router.push("/auth/register")
                                        closeMobileMenu()
                                    }}
                                >Get Started</a>
                            </div>
                        </div>
                    </div>
                )}
            </Container>

            {activeMenu && menuItems.find((item) => item.title === activeMenu)?.submenu && (
                <div
                    className="absolute left-0 top-20 w-full bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700"
                    onMouseEnter={() => handleMouseEnter(activeMenu)}
                    onMouseLeave={handleMouseLeave}
                >
                    <Container>
                        <div className="py-8 grid grid-cols-4 gap-8">
                            {(menuItems?.find((item) => item.title === activeMenu)?.submenu || []).map((subItem, index) => (
                                <a
                                    href={subItem.link}
                                    onClick={() => {
                                        router.push(subItem.link)
                                        handleMouseLeave()
                                    }}
                                    key={index}
                                    className="block space-y-2 p-3 hover:bg-[#FFF7E8] dark:hover:bg-gray-700 rounded-md"
                                >
                                    <h3 className="text-[14px] font-semibold">{subItem.title}</h3>
                                    <p className="text-[12px] text-gray-600 dark:text-gray-400">{subItem.description}</p>
                                </a>
                            ))}
                        </div>
                    </Container>
                </div>
            )}
        </header>
        </>
    );
}