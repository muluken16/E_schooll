import styled from 'styled-components';

export const SidebarContainer = styled.div`
  width: 280px;
  background: linear-gradient(to bottom, #2c3e50, #3498db);
  height: 100vh;
  padding: 1rem 0;
  position: fixed;
  top: 0;
  left: 0;
  transition: transform 0.3s ease-in-out;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  color: white;
  margin-top: 60px;

  @media (max-width: 768px) {
    transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(-100%)')};
  }
`;

export const SidebarHeader = styled.div`
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
  flex-shrink: 0; /* Prevent header from shrinking */
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 500;
  }
`;

export const UserRole = styled.span`
  font-size: 0.8rem;
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  display: inline-block;
  margin-top: 0.25rem;
`;

export const NavItemsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 0.5rem;
  
  /* Custom scrollbar for webkit browsers */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
  }
`;

export const NavItem = styled.div`
  margin: 0.25rem 0;
  border-radius: 8px;
  overflow: hidden;
  
  a, .logout-btn {
    display: flex;
    align-items: center;
    padding: 0.85rem 1rem;
    text-decoration: none;
    color: rgba(255, 255, 255, 0.9);
    transition: all 0.2s ease;
    background: transparent;
    border: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    .icon {
      margin-right: 0.75rem;
      display: flex;
      align-items: center;
      opacity: 0.8;
    }
    
    .label {
      flex: 1;
    }
  }
  
  // Active link style
  a.active {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    font-weight: 500;
    
    .icon {
      opacity: 1;
    }
  }
`;

export const SidebarFooter = styled.div`
  margin-top: auto;
  padding: 1rem 0.5rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0; /* Prevent footer from shrinking */
`;

export const Overlay = styled.div`
  position: fixed;
  top: 60px; /* Account for the top navbar */
  left: 0;
  width: 100%;
  height: calc(100vh - 60px);
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;

  @media (min-width: 769px) {
    display: none;
  }
`;