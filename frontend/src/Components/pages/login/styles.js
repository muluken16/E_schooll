import styled from 'styled-components';

export const Container = styled.div`
  max-width: 400px;
  margin: 100px auto;
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
`;
export const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
`;
export const ErrorText = styled.p`
  color: red;
  text-align: center;
`;
export const Form = styled.form`
  display: flex;
  flex-direction: column;
`;
export const Label = styled.label`
  margin-bottom: 0.5rem;
`;
export const Input = styled.input`
  padding: 0.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  &:focus { border-color: #007bff; }
`;
export const Button = styled.button`
  padding: 0.75rem;
  background: darkcyan;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover { background: #0056b3; }
`;
