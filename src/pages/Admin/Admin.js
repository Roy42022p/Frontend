import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Admin.module.css';
import AdminSidebar from '../../layouts/AdminSidebar/AdminSidebar';
import Students from "../../components/students/Students";
import Curators from "../../components/curators/Curators";
import Groups from "../../components/groups/Groups";
import Exams from "../../components/exams/Exams";

const Admin = () => {
    const location = useLocation();
    const [active, setActive] = useState('Преподаватели');

    useEffect(() => {
        if (location.state?.active) {
            setActive(location.state.active);
        }
    }, [location.state]);

    const renderContent = () => {
        switch (active) {
            case 'Студенты':
                return <Students />;
            case 'Преподаватели':
                return <Curators />;
            case 'Группы':
                return <Groups />;
            case 'Экзамены':
                return <Exams type={"exam"}/>;
            case 'Зачеты':
                return <Exams type={"credits"}/>;
            default:
                return <h1>Выберите раздел</h1>;
        }
    };

    return (
        <div className={styles.adminPage}>
            <AdminSidebar active={active} basePath="/admin" />
            <div className={styles.content}>
                {renderContent()}
            </div>
        </div>
    );
};

export default Admin;
