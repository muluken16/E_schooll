import React, { useState } from 'react';
import Navbar from '../navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';
import styled from 'styled-components';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <>
            <Navbar onLogout={handleLogout} toggleSidebar={toggleSidebar} />
            <Wrapper>
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <Main>{children}</Main>
            </Wrapper>
        </>
    );
};

export default Layout;

const Wrapper = styled.div`
  display: flex;
`;

const Main = styled.div`
  margin-left: 270px;
  padding: 1rem;
  width: 100%;
  min-height: calc(100vh - 60px);
  background: #f0f2f5;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;
