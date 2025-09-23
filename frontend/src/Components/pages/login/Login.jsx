import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar'; // Adjust path based on your project
import {
  Container,
  Title,
  ErrorText,
  Form,
  Label,
  Input,
  Button
} from './styles'; // Ensure these styled components exist

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Reset error before login attempt

    try {
      const res = await axios.post('http://localhost:8000/api/login/', {
        email,
        password
      });

      const { access_token, refresh_token, user } = res.data;

      // Save JWT and user info in localStorage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);

      // Show backend error if available
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Invalid email or password');
      }
    }
  };

  return (
    <>
      {/* Navbar */}
      <Navbar
        isMenuOpen={false}
        toggleMenu={() => {}}
        activeSection=""
        scrollToSection={() => {}}
      />

      <Container>
        <Title style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
          Login
        </Title>

        {error && <ErrorText>{error}</ErrorText>}

        <Form onSubmit={handleLogin}>
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit">Login</Button>
        </Form>
      </Container>
    </>
  );
};

export default Login;
