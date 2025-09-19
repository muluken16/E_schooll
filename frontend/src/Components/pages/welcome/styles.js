import styled from 'styled-components';

export const Container = styled.div`
  max-width: 600px;
  margin: 50px auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
`;
export const Title = styled.h2`
  margin-bottom: 1rem;
`;
export const Info = styled.p`
  margin: 0.5rem 0;
`;
export const Button = styled.button`
  margin-top: 1rem;
  padding: 0.75rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover { background: #c82333; }
`;
