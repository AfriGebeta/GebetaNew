// @ts-nocheck

import {useEffect, useState} from 'react';

export const useNavbarLogic = () => {
    const [activeMenu, setActiveMenu] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeMobileSubmenu, setActiveMobileSubmenu] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        const handleClickOutside = (event) => {
            const navbar = document.getElementById('navbar-container');
            if (navbar && !navbar.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    let timeoutId;
    const handleMouseEnter = (menuTitle) => {
        clearTimeout(timeoutId);
        setActiveMenu(menuTitle);
    };

    const handleMouseLeave = () => {
        timeoutId = setTimeout(() => setActiveMenu(null), 200);
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const toggleMobileSubmenu = (menuTitle) => {
        setActiveMobileSubmenu(activeMobileSubmenu === menuTitle ? null : menuTitle);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        setActiveMobileSubmenu(null);
    };

    return {
        activeMenu,
        isScrolled,
        isMobileMenuOpen,
        activeMobileSubmenu,
        handleMouseEnter,
        handleMouseLeave,
        toggleMobileMenu,
        toggleMobileSubmenu,
        closeMobileMenu,
    };
};