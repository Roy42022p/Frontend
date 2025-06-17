import React, {useCallback, useEffect, useState} from 'react';
import styles from './Student.module.css';
import api from '../../api';
import { IMaskInput } from 'react-imask';
import { useNavigate } from 'react-router-dom';
import {
    GraduationCap,
    Users,
    UserRound,
    Send,
    CreditCard,
    Phone,
    Mail,
    Calendar,
    X,
    LogOut
} from 'lucide-react';

const Student = () => {
    const [studentData, setStudentData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        snils: '',
        telephone: '',
        mail: '',
        dateOfBirth: ''
    });
    const [errors, setErrors] = useState({
        snils: '',
        telephone: ''
    });
    const [loading, setLoading] = useState(false);

    const username = localStorage.getItem('username');
    const navigate = useNavigate();

    const validateSnils = (snils) => {
        const snilsRegex = /^\d{3}-\d{3}-\d{3} \d{2}$/;
        if (!snils) return '';
        return snilsRegex.test(snils) ? '' : 'СНИЛС должен быть в формате XXX-XXX-XXX XX';
    };

    const validateTelephone = (telephone) => {
        const phoneRegex = /^\+7-\(\d{3}\)-\d{3}-\d{2}-\d{2}$/;
        if (!telephone) return '';
        return phoneRegex.test(telephone) ? '' : 'Телефон должен быть в формате +7-(495)-555-32-32';
    };

    const fetchStudentData = useCallback(async () => {
        try {
            const response = await api.get(`/student/by-login/${username}`);
            setStudentData(response.data);
            setFormData({
                snils: response.data.snils || '',
                telephone: response.data.telephone || '',
                mail: response.data.mail || '',
                dateOfBirth: response.data.dateOfBirth || ''
            });
        } catch (error) {
            console.error('Error fetching student data:', error);
        }
    }, [username]);


    useEffect(() => {
        if (username) {
            fetchStudentData();
        } else {
            console.warn('Username not found in localStorage');
        }
    }, [username, fetchStudentData]);


    const displayData = (data) => {
        if (data === null || data === undefined || data === '') {
            return 'Нет данных';
        }
        return data;
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setErrors({ snils: '', telephone: '' });
    };

    const handleChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'snils') {
            setErrors(prev => ({ ...prev, snils: validateSnils(value) }));
        } else if (name === 'telephone') {
            setErrors(prev => ({ ...prev, telephone: validateTelephone(value) }));
        }
    };

    const handleSave = async () => {
        const snilsError = validateSnils(formData.snils);
        const telephoneError = validateTelephone(formData.telephone);

        setErrors({ snils: snilsError, telephone: telephoneError });

        if (snilsError || telephoneError) {
            return;
        }

        if (!studentData || !studentData.id) {
            console.error('Student ID is missing');
            return;
        }

        setLoading(true);
        try {
            const response = await api.patch(`student/update/${studentData.id}`, formData);
            setStudentData(prev => ({
                ...prev,
                ...response.data
            }));
            setFormData({
                snils: response.data.snils || '',
                telephone: response.data.telephone || '',
                mail: response.data.mail || '',
                dateOfBirth: response.data.dateOfBirth || ''
            });
            setIsModalOpen(false);
            fetchStudentData();
            setErrors({ snils: '', telephone: '' });
        } catch (error) {
            console.error('Error updating student data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('login');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        navigate('/');
    };

    if (!studentData) {
        return <div>Загрузка...</div>;
    }

    const isSaveDisabled = loading || errors.snils || errors.telephone;

    return (
        <div className={styles.studPage}>
            <div className={styles.content}>
                <div className={styles.header}>
                    Привет, {displayData(studentData.firstName)}
                </div>
                <div className={styles.data}>
                    <div className={styles.dataHeader}>
                        <GraduationCap size={26} />
                        <div>
                            <p className={styles.dst}>
                                {displayData(studentData.lastName)} {displayData(studentData.firstName)} {displayData(studentData.patronymic)}
                            </p>
                            <p className={styles.dsd}>{displayData(username)}</p>
                        </div>
                    </div>
                    <div className={styles.dataElements}>
                        <div className={styles.dataElement}>
                            <Users size={18} style={{ marginRight: '8px' }} />
                            Группа: {displayData(studentData.group_name)}
                        </div>
                        <div className={styles.dataElement}>
                            <UserRound size={18} style={{ marginRight: '8px' }} />
                            Преподаватель: {displayData(studentData.curator_fullname)}
                        </div>
                        <div className={styles.dataElement}>
                            <Send size={18} style={{ marginRight: '8px' }} />
                            Telegram: {studentData.tg_id ? studentData.tg_id : 'Нет данных'}
                        </div>
                        <div className={styles.dataElement}>
                            <CreditCard size={18} style={{ marginRight: '8px' }} />
                            СНИЛС: {displayData(studentData.snils)}
                        </div>
                        <div className={styles.dataElement}>
                            <Phone size={18} style={{ marginRight: '8px' }} />
                            Телефон: {displayData(studentData.telephone)}
                        </div>
                        <div className={styles.dataElement}>
                            <Mail size={18} style={{ marginRight: '8px' }} />
                            Почта: {displayData(studentData.mail)}
                        </div>
                        <div className={styles.dataElement}>
                            <Calendar size={18} style={{ marginRight: '8px' }} />
                            Дата рождения: {displayData(studentData.dateOfBirth)}
                        </div>
                    </div>

                    <button className={styles.editButton} onClick={openModal}>
                        Заполнить дополнительную информацию
                    </button>
                    <button className={styles.exitButton} onClick={handleLogout}>
                        <LogOut size={18} style={{ marginRight: '8px' }} />
                        Выйти
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <button className={styles.modalClose} onClick={closeModal} disabled={loading}>
                            <X size={20} />
                        </button>
                        <h2>Изменить данные студента</h2>
                        <p className={styles.md}>Измените форму для обновления данных аккаунта студента.</p>
                        <label>
                            СНИЛС:
                            <IMaskInput
                                mask="000-000-000 00"
                                value={formData.snils}
                                onAccept={(value) => handleChange('snils', value)}
                                disabled={loading}
                                placeholder="252-428-327 01"
                                className={styles.inputField}
                            />
                            {errors.snils && <p className={styles.error}>{errors.snils}</p>}
                        </label>
                        <label>
                            Телефон:
                            <IMaskInput
                                mask="+7-(000)-000-00-00"
                                value={formData.telephone}
                                onAccept={(value) => handleChange('telephone', value)}
                                disabled={loading}
                                placeholder="+7-(495)-555-32-32"
                                className={styles.inputField}
                            />
                            {errors.telephone && <p className={styles.error}>{errors.telephone}</p>}
                        </label>
                        <label>
                            Почта:
                            <input
                                type="email"
                                name="mail"
                                value={formData.mail}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                                disabled={loading}
                                placeholder="Введите почту"
                                className={styles.inputField}
                            />
                        </label>
                        <label>
                            Дата рождения:
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                                disabled={loading}
                                className={styles.inputField}
                            />
                        </label>
                        <button
                            className={styles.saveButton}
                            onClick={handleSave}
                            disabled={isSaveDisabled}
                        >
                            {loading ? 'Сохраняем...' : 'Сохранить'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Student;
