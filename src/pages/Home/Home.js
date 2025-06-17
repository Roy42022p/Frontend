import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import bg from '../../assets/bg.svg';
import studentLogo from '../../assets/Ellipse1.svg';
import curatorLogo from '../../assets/Ellipse2.svg';
import adminLogo from '../../assets/Ellipse3.svg';
import idk from '../../assets/idk.svg';
import styles from './Home.module.css';

function Home() {
    return (
        <div>
            <header className={styles.homeHeader}>
                <img src={logo} className={styles.logo} alt="logo" />
                <p className={styles.phh}>
                    Навигатор промежуточной аттестации групп<br />
                    корпуса “Угреша”
                </p>
            </header>
            <div className={styles.fhc}>
                <img className={styles.ifhc} src={bg} alt="background" />
                <p className={styles.centeredTitle}>
                    Сайт создан для упрощения взаимодействия между студентами, преподавателями и администрацией, обеспечивает удобный доступ к важной информации и инструментам управления.
                </p>
                <div className={styles.linkContainer}>
                    <Link to="/login" className={styles.linkItem}>
                        <img src={studentLogo} alt="Студент" className={styles.linkImage} />
                        <p className={styles.linkText}>Студент</p>
                    </Link>

                    <Link
                        to="/login/staff"
                        state={{ role: 'curator' }}
                        className={styles.linkItem}
                    >
                        <img src={curatorLogo} alt="Преподаватель" className={styles.linkImage} />
                        <p className={styles.linkText}>Преподаватель</p>
                    </Link>

                    <Link
                        to="/login/staff"
                        state={{ role: 'admin' }}
                        className={styles.linkItem}
                    >
                        <img src={adminLogo} alt="Администрация" className={styles.linkImage} />
                        <p className={styles.linkText}>Администрация</p>
                    </Link>
                </div>
                <div>
                    <img className={styles.ifhc} src={idk} alt="additional logo" />
                </div>
            </div>
        </div>
    );
}

export default Home;