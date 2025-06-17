import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Curator.module.css';
import AdminSidebar from '../../layouts/AdminSidebar/AdminSidebar';
import Students from "../../components/students/Students";
import Exams from "../../components/exams/Exams";

const Curator = ({page}) => {
    const location = useLocation();
    const [active, setActive] = useState('Студенты');

    useEffect(() => {
        if (location.state?.active) {
            setActive(location.state.active);
        }
    }, [location.state]);

    const renderContent = () => {
        switch (active) {
            case 'Студенты':
                return <Students />;
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
            <AdminSidebar active={active} basePath="/curator" page="curator" />
            <div className={styles.content}>
                {renderContent()}
            </div>
        </div>
    );
};

export default Curator;
