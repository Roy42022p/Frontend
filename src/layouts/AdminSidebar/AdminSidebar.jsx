import React, { useRef, useEffect, useState } from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import styles from './AdminSidebar.module.css';
import { GraduationCap, Users, BookOpen, FileText, CheckCircle, LogOut } from 'lucide-react';

function AdminSidebar({ active, basePath, page }) {
    const menuRef = useRef(null);
    const sidebarRef = useRef(null);
    const location = useLocation();

    const username = localStorage.getItem('username') || 'Пользователь';
    const role = localStorage.getItem('role') || 'Роль';
    const initial = username.charAt(0).toUpperCase();

    const [profileOpen, setProfileOpen] = useState(false);
    const navigate = useNavigate();

    const allMenuItems = [
        { label: 'Преподаватели', icon: <Users size={16} /> },
        { label: 'Группы', icon: <BookOpen size={16} /> },
        { label: 'Студенты', icon: <GraduationCap size={16} /> },
        { label: 'Экзамены', icon: <FileText size={16} /> },
        { label: 'Зачеты', icon: <CheckCircle size={16} /> },
    ];

    const menuItems = page === 'curator'
        ? allMenuItems.filter(item => item.label !== 'Преподаватели' && item.label !== 'Группы')
        : allMenuItems;

    const isExamDetailPage = /^\/exam\/\d+$/.test(location.pathname);

    useEffect(() => {
        const menu = menuRef.current;
        const activeItem = menu.querySelector(`.${styles.menuItem}.${styles.active}`);
        if (activeItem) {
            const { offsetTop, offsetHeight } = activeItem;
            menu.style.setProperty('--highlight-top', `${offsetTop}px`);
            menu.style.setProperty('--highlight-height', `${offsetHeight}px`);
        } else {
            menu.style.setProperty('--highlight-top', '0');
            menu.style.setProperty('--highlight-height', '0');
        }
    }, [active, location.pathname]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileOpen && !sidebarRef.current?.contains(event.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [profileOpen]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('login');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        navigate('/');
    };

    return (
        <div ref={sidebarRef} className={styles.sidebar}>
            <h2 className={styles.title}>Меню</h2>
            <ul className={styles.menu} ref={menuRef}>
                {menuItems.map(({ label, icon }) => {
                    const isActive = !isExamDetailPage && active === label;
                    return (
                        <li key={label}>
                            <Link
                                to={basePath}
                                state={{ active: label }}
                                className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
                            >
                                <span className={styles.icon}>{icon}</span>
                                {label}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <div
                className={`${styles.profile} ${profileOpen ? styles.profileOpen : ''}`}
                onClick={() => setProfileOpen(prev => !prev)}
            >
                <div className={styles.avatar}>{initial}</div>
                <div className={styles.userInfo}>
                    <div className={styles.role}>{role}</div>
                    <div className={styles.name}>{username}</div>
                </div>
            </div>

            {profileOpen && (
                <div className={styles.profilePanel}>
                    <div className={styles.ppt}>
                        <div className={styles.avatar}>{initial}</div>
                        <div className={styles.userInfo}>
                            <div className={styles.role}>{role}</div>
                            <div className={styles.name}>{username}</div>
                        </div>
                    </div>
                    <div className={styles.exitButton} onClick={handleLogout}>
                        <LogOut size={18} style={{ marginRight: '8px' }} />
                        Выйти
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminSidebar;
