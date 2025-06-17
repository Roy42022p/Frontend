import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import AuthForm from '../../components/global/AuthForm/AuthForm';
import api from '../../api';

const Login = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        try {
            const formData = new FormData();
            formData.append('username', login);
            formData.append('password', password);

            const response = await api.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const { access_token, role, username } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('role', role);
            localStorage.setItem('username', username);

            if (role === 'student') {
                navigate('/student');
            }  else {
                console.warn('Неизвестная роль:', role);
            }
        } catch (error) {
            setFormError(error.response?.data?.detail || 'Ошибка авторизации');
        }
    };

    return (
        <div className={styles.staff}>
            <div className={styles.authContainer}>
                <div className={styles.shd}>
                    <h2 className={styles.header}>Авторизация</h2>
                    <p className={styles.description}>Вход для студентов</p>
                </div>

                <AuthForm
                    onSubmit={handleSubmit}
                    login={login}
                    password={password}
                    setLogin={setLogin}
                    setPassword={setPassword}
                    error={formError}
                    showSuperKey={false}
                    styles={styles}
                />

                <p className={styles.rlp}>
                    <a href="https://t.me/Ygresha_bot" target="_blank" rel="noopener noreferrer" className={styles.registerLink}>
                        Регистрация
                    </a>
                </p>
            </div>
            <p className={styles.rlph}>
                <Link to="/" className={styles.backToHome}>На главную</Link>
            </p>
        </div>
    );
};

export default Login;
