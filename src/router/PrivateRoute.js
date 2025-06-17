import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ element: Component, allowedRoles }) => {
    const token = localStorage.getItem('access_token');
    const location = useLocation();

    const publicRoutes = ['/login', '/login/staff', '/login/x-api'];

    const decodeToken = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '_').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                window.atob(base64).split('').map(c =>
                    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                ).join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    if (publicRoutes.includes(location.pathname)) {
        return Component;
    }

    if (!token) {
        return <Navigate to="/" />;
    }

    const decodedToken = decodeToken(token);

    if (!decodedToken || decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem('access_token');
        return <Navigate to="/" />;
    }

    if (allowedRoles && !allowedRoles.includes(decodedToken.role)) {
        return <Navigate to="/" />;
    }

    return Component;
};

export default PrivateRoute;
