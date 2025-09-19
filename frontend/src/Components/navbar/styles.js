import styled from 'styled-components';

export const NavBarContainer = styled.div`
  height: 60px;
  background: linear-gradient(135deg, #1a5f7a 0%, #159895 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  color: white;
  position: sticky;
  top: 0;
  z-index: 1000;
`;

export const Logo = styled.h1`
  font-size: 1.4rem;
`;

export const LogoutButton = styled.button`
  background: transparent;
  color: white;
  border: 1px solid white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: white;
    color: #007bff;
  }
`;

export const MenuButton = styled.button`
  background: none;
  color: white;
  font-size: 1.8rem;
  border: none;
  cursor: pointer;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;
