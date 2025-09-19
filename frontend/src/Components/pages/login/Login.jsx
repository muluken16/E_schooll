import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';  // ✅ adjust path based on your folder structure
import {
  Container, Title, ErrorText, Form,
  Label, Input, Button
} from './styles';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/login/', { email, password });
      const { access, refresh, user } = res.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    }
  };

  return (
    <>
      {/* ✅ Navbar at the top */}
      <Navbar
        isMenuOpen={false}
        toggleMenu={() => {}}
        activeSection=""
        scrollToSection={() => {}}
      />

      <Container>
        <Title>Login</Title>
        {error && <ErrorText>{error}</ErrorText>}
        <Form onSubmit={handleLogin}>
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Button type="submit">Login</Button>
        </Form>
      </Container>
    </>
  );
};

export default Login;
