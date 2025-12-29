// utils/auth.js
export const setToken = (token) => {
    localStorage.setItem('access_token', token);
};

export const setRefreshToken = (refreshToken) => {
    localStorage.setItem('refresh_token', refreshToken);
};

export const clearToken = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
};

export const getToken = () => {
    return localStorage.getItem('access_token');
};

export const getRefreshToken = () => {
    return localStorage.getItem('refresh_token');
};

export const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('access_token');
};

// Token refresh function
export const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:8000/api/token/refresh/"
        : "https://eschooladmin.etbur.com/api/token/refresh/";

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refresh: refreshToken
            })
        });

        if (response.ok) {
            const data = await response.json();
            setToken(data.access);
            return data.access;
        } else {
            // Refresh token is invalid, clear all tokens
            clearToken();
            throw new Error('Refresh token expired');
        }
    } catch (error) {
        clearToken();
        throw error;
    }
};

// Enhanced API request function with automatic token refresh
export const makeAuthenticatedRequest = async (url, options = {}) => {
    let token = getToken();
    
    if (!token) {
        throw new Error('No access token available');
    }

    // First attempt with current token
    const requestOptions = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    };

    try {
        let response = await fetch(url, requestOptions);
        
        // If unauthorized, try to refresh token
        if (response.status === 401) {
            console.log('Token expired, attempting refresh...');
            
            try {
                token = await refreshAccessToken();
                console.log('Token refreshed successfully');
                
                // Retry request with new token
                requestOptions.headers.Authorization = `Bearer ${token}`;
                response = await fetch(url, requestOptions);
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // Redirect to login
                window.location.href = '/login';
                throw new Error('Authentication failed');
            }
        }

        return response;
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
};
