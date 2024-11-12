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

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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

    return {
        activeMenu,
        isScrolled,
        isMobileMenuOpen,
        activeMobileSubmenu,
        handleMouseEnter,
        handleMouseLeave,
        toggleMobileMenu,
        toggleMobileSubmenu,
    };
};
