import React, { useState } from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import styles from './Staff.module.css';
import AuthForm from '../../../components/global/AuthForm/AuthForm';
import api from "../../../api";

const Staff = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [superKey, setSuperKey] = useState('');
    const [formError, setFormError] = useState('');


    const navigate = useNavigate();
    const location = useLocation();
    const initialRole = location.state?.role || '';


    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        try {
            const formData = new FormData();
            formData.append('username', login);
            formData.append('password', password);
            formData.append('secret_key', superKey);

            const response = await api.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const { access_token, role, username } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('role', role);
            localStorage.setItem('username', username);

            if (role === 'admin') {
                navigate('/admin');
            } else if (role === 'curator') {
                navigate('/curator');
            } else {
                console.warn('Неизвестная роль:', role);
            }
        } catch (error) {
            setFormError(error.response?.data?.detail || 'Ошибка регистрации');
        }
    };


    return (
        <div className={styles.staff}>
            <div className={styles.authContainer}>
                <div className={styles.shd}>
                    <h2 className={styles.header}>Авторизация</h2>
                    <p className={styles.description}>Вход для кураторов и администраторов</p>
                </div>

                <AuthForm
                    onSubmit={handleSubmit}
                    login={login}
                    password={password}
                    superKey={superKey}
                    setLogin={setLogin}
                    setPassword={setPassword}
                    setSuperKey={setSuperKey}
                    error={formError}
                    styles={styles}
                />

                <p className={styles.rlp}>
                    {initialRole === 'curator' ? (
                        <a href="https://t.me/Ygresha_bot" target="_blank" rel="noopener noreferrer" className={styles.registerLink}>
                            Регистрация
                        </a>
                    ) : (
                        <Link to="/login/x-api" className={styles.registerLink}>
                            Регистрация
                        </Link>
                    )}
                </p>

            </div>
            <p className={styles.rlph}>
                <Link to="/" className={styles.backToHome}>На главную</Link>
            </p>
        </div>
    );
};

export default Staff;
