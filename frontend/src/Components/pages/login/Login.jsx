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
      // Use local development URL
      const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:8000/api/login/"
        : "https://eschooladmin.etbur.com/api/login/";

      const res = await axios.post(API_URL, {
        email,
        password
      });

      const { access_token, refresh_token, user } = res.data;

      // Save JWT and user info in localStorage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect based on user role
      if (user.role === 'student') {
        navigate('/dashboard');
      } else if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard'); // Default fallback
      }
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
