import React from 'react';
import { NavBarContainer, Logo, LogoutButton, MenuButton } from './styles';

const Navbar = ({ onLogout, toggleSidebar }) => {
    return (
        <NavBarContainer>
            <MenuButton onClick={toggleSidebar}>☰</MenuButton>
            <Logo>EduPortal</Logo>
            <LogoutButton onClick={onLogout}>Logout</LogoutButton>
        </NavBarContainer>
    );
};

export default Navbar;
