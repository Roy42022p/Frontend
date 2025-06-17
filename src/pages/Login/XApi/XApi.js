import React, { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import styles from './XApi.module.css';
import AuthForm from '../../../components/global/AuthForm/AuthForm';
import axios from "axios";

const XApi = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [superKey, setSuperKey] = useState('');
    const [formError, setFormError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const apiUrl = process.env.REACT_APP_API_URL;

        try {
            const response = await axios.post(
                `${apiUrl}/auth/register`,
                new URLSearchParams({
                    username: login,
                    password: password,
                    secret_key: superKey,
                })
            );

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
                    <h2 className={styles.header}>Администрирование</h2>
                    <p className={styles.description}>Введите данные для создания аккаунта администратора или куратора</p>
                </div>

                <AuthForm
                    onSubmit={handleSubmit}
                    login={login}
                    password={password}
                    superKey={superKey}
                    setLogin={setLogin}
                    setPassword={setPassword}
                    setSuperKey={setSuperKey}
                    styles={styles}
                    error={formError}
                    submitText="Создать"
                />
            </div>

            <p className={styles.rlph}>
                <Link to="/" className={styles.backToHome}>На главную</Link>
            </p>
        </div>
    );
};

export default XApi;
