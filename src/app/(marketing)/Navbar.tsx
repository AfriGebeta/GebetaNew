//@ts-nocheck
"use client";
import Image from "next/image";
import Link from "next/link";
import Container from "@/sections/Container";
import {menuItems} from "@/constants";
import {useNavbarLogic} from "@/utils/useNavbarLogic";
import {User2Icon} from "lucide-react";

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

    return (
        <header
            id="navbar-container"
            className={`fixed top-0 left-0 right-0 z-[1000] bg-white dark:bg-[#05050a] transition-shadow duration-300 ${
                isScrolled ? "shadow-md" : ""
            }`}
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

                    <div className="sm:hidden">
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

                    <div className="hidden sm:flex flex-grow justify-center">
                        <ul className="flex text-[#2E384E] dark:text-white text-[14px] font-medium">
                            {menuItems.map((item, index) => (
                                <li
                                    key={index}
                                    className="relative px-4 py-2 cursor-pointer hover:text-[#FFA500] transition-colors duration-200"
                                    onMouseEnter={() => item.submenu && handleMouseEnter(item.title)}
                                    onMouseLeave={item.submenu && handleMouseLeave}
                                >
                                    <Link href={item.link || "#"} className="flex items-center gap-1">
                                        {item.title}
                                        {item.submenu && (
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="hidden sm:flex gap-8">
                        <div className="flex items-center gap-[4px]">
                            <Image
                                className="dark:fill-whitesmoke"
                                src="/assets/user.svg"
                                alt="user icon"
                                width={24}
                                height={24}/>
                            <Link
                                className="font-medium hover:text-[#FFA500] transition-all duration-400"
                                href="/auth/signin"
                            >Sign In</Link>
                        </div>
                        <div
                            className="px-[30px] py-[15px] transition-all border border-[#D2C09D] hover:border-[#FFA500] hover:text-[#FFA500] hover:bg-[#FFA500]/20 text-[14px] rounded-[8px]">
                            <Link
                                className="font-bold"
                                href="/auth/register"
                            >Get Started</Link>
                        </div>
                    </div>
                </nav>

                {isMobileMenuOpen && (
                    <div className="sm:hidden bg-white dark:bg-[#05050a] pb-4">
                        <ul className="text-[#2E384E] dark:text-white text-[14px] font-medium">
                            {menuItems.map((item, index) => (
                                <li key={index} className="px-4 py-2">
                                    <div className="flex justify-between items-center"
                                         onClick={() => item?.submenu && toggleMobileSubmenu(item.title)}>
                                        <Link href={item.link || "#"} onClick={closeMobileMenu}>
                                            {item.title}
                                        </Link>
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
                                                <Link
                                                    href={subItem.link}
                                                    key={subIndex}
                                                    onClick={closeMobileMenu}
                                                    className="text-sm p-2 hover:bg-[#FFF7E8] dark:hover:bg-gray-700 rounded-md"
                                                >
                                                    {subItem.title}
                                                </Link>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 space-y-4 px-4">
                            <div className="flex items-center gap-[4px]">
                                <User2Icon className="w-[16px] h-[16px]"/>
                                <Link
                                    className="font-medium"
                                    href="/auth/signin"
                                    onClick={closeMobileMenu}
                                >Sign In</Link>
                            </div>
                            <div
                                className="w-fit px-[30px] py-[15px] transition-all border border-[#D2C09D] hover:border-[#FFA500] hover:text-[#FFA500] hover:bg-[#FFA500]/20 text-[14px] rounded-[8px]">
                                <Link
                                    className="font-bold"
                                    href="/auth/register"
                                    onClick={closeMobileMenu}
                                >Get Started</Link>
                            </div>
                        </div>
                    </div>
                )}
            </Container>

            {activeMenu && menuItems.find((item) => item.title === activeMenu)?.submenu && (
                <div
                    className="absolute left-0 w-full bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700"
                    onMouseEnter={() => handleMouseEnter(activeMenu)}
                    onMouseLeave={handleMouseLeave}
                >
                    <Container>
                        <div className="py-8 grid grid-cols-4 gap-8">
                            {(menuItems?.find((item) => item.title === activeMenu)?.submenu || []).map((subItem, index) => (
                                <Link
                                    href={subItem.link}
                                    onClick={handleMouseLeave}
                                    key={index}
                                    className="block space-y-2 p-3 hover:bg-[#FFF7E8] dark:hover:bg-gray-700 rounded-md"
                                >
                                    <h3 className="text-[14px] font-semibold">{subItem.title}</h3>
                                    <p className="text-[12px] text-gray-600 dark:text-gray-400">{subItem.description}</p>
                                </Link>
                            ))}
                        </div>
                    </Container>
                </div>
            )}
        </header>
    );
}