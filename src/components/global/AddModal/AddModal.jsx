import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import api from '../../../api';
import styles from './AddModal.module.css';
import Select from 'react-select';

const Modal = ({ isOpen, onClose, title, description, type }) => {
    const [isClosing, setIsClosing] = useState(false);
    const modalRef = useRef(null);
    const animationTimeoutRef = useRef(null);
    const [groups, setGroups] = useState([]);

    const defaultFormData = useMemo(() => ({
        lastName: '',
        firstName: '',
        middleName: '',
        login: '',
        password: '',
        newGroupName: '',
        selectedTeacher: '',
        semester: '',
        course: '',
        discipline: '',
        selectedGroup: '',
        examDate: ''
    }), []);

    const [formData, setFormData] = useState(defaultFormData);

    const disciplines = [
        'Русский язык',
        'Литература',
        'Иностранный язык',
        'Математика',
        'Информатика',
        'История',
        'Обществознание',
        'География',
        'Физика',
        'Химия',
        'Биология',
        'Физическая культура',
        'Основы безопасности жизнедеятельности',
        'Индивидуальный проект (не является учебным предметом)',
        'Предлагаемые ОО',
        'Введение в специальность',
        'Общий гуманитарный и социально-экономический цикл',
        'Основы философии',
        'История',
        'Иностранный язык в профессиональной деятельности',
        'Физическая культура',
        'Психология общения',
        'Математический и общий естественнонаучный цикл',
        'Элементы высшей математики',
        'Дискретная математика с элементы математической логики',
        'Теория вероятностей и математическая статистика',
        'Общепрофессиональный цикл',
        'Операционные системы и среды',
        'Архитектура аппаратных средств',
        'Информационные технологии',
        'Основы алгоритмизации и программирования',
        'Правовое обеспечение профессиональной деятельности',
        'Безопасность жизнедеятельности',
        'Экономика отрасли',
        'Основы проектирования баз данных',
        'Стандартизация, сертификация и техническое документоведение',
        'Численные методы',
        'Компьютерные сети',
        'Менеджмент в профессиональной деятельности',
        'Программирование сайтов и Web-дизайн',
        'Основы предпринимательской деятельности и построения карьеры',
        'Русский язык и культура речи / социальная адаптация и основы социально-правовых знаний',
        'Экологические основы природопользования',
        'Профессиональный цикл',
        'Профессиональные модули',
        'Разработка модулей программного обеспечения для компьютерных систем',
        'Разработка программных модулей',
        'Поддержка и тестирование программных модулей',
        'Разработка мобильных приложений',
        'Системное программирование',
        'Учебная практика',
        'Производственная практика',
        'Осуществление интеграции программных модулей',
        'Технология разработки программного обеспечения',
        'Инструментальные средства разработки программного обеспечения',
        'Математическое моделирование',
        'Учебная практика',
        'Производственная практика',
        'Сопровождение и обслуживание программного обеспечения компьютерных систем',
        'Внедрение и поддержка компьютерных систем',
        'Обеспечение качества функционирования компьютерных систем',
        'Учебная практика',
        'Производственная практика',
        'Разработка, администрирование и защита баз данных',
        'Технология разработки и защиты баз данных',
        'Учебная практика',
        'Производственная практика',
        'Разработчик Python',
        'Python для автоматизации ИТ-инфраструктуры',
        'Учебная практика',
        'Производственная практика'
    ];

    const semesters = Array.from({ length: 10 }, (_, i) => i + 1);
    const courses = Array.from({ length: 5 }, (_, i) => i + 1);

    const [curators, setCurators] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });

    const transliterate = (text) => {
        const cyrillicToLatin = {
            а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
            з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
            п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
            ч: 'ch', ш: 'sh', щ: 'shch', ы: 'y', э: 'e', ю: 'yu', я: 'ya'
        };
        return text
            .toLowerCase()
            .split('')
            .map(char => cyrillicToLatin[char] || char)
            .join('');
    };

    const generateRandomDigits = (length) => {
        return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
    };

    const handleChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleClose = useCallback(() => {
        setIsClosing(true);
        animationTimeoutRef.current = setTimeout(() => {
            setIsClosing(false);
            setMessage({ type: '', text: '' });
            setFormData(defaultFormData);
            onClose();
        }, 300);
    }, [onClose, defaultFormData]);

    const generateLogin = useCallback((lastName, firstName, middleName) => {
        const last = transliterate(lastName.trim());
        const f = transliterate((firstName.trim()[0] || '')).toUpperCase();
        const m = transliterate((middleName.trim()[0] || '')).toUpperCase();
        return `${last}${f}${m}`;
    }, []);

    useEffect(() => {
        if (type !== 'curator' && type !== 'student') return;

        const lastName = formData.lastName;
        const firstName = formData.firstName;
        const middleName = formData.middleName;

        if (lastName && firstName && middleName) {
            const generatedLogin = generateLogin(lastName, firstName, middleName);

            setFormData(prev => {
                if (prev.login !== generatedLogin) {
                    return { ...prev, login: generatedLogin };
                }
                return prev;
            });

            if (type === 'curator') {
                const f = transliterate((firstName.trim()[0] || '')).toUpperCase();
                const m = transliterate((middleName.trim()[0] || '')).toUpperCase();
                const generatedPassword = `${f}${m}${transliterate(lastName.slice(0, 3))}#${generateRandomDigits(3)}`;

                setFormData(prev => {
                    if (prev.password !== generatedPassword) {
                        return { ...prev, password: generatedPassword };
                    }
                    return prev;
                });
            }
        }
    }, [formData.lastName, formData.firstName, formData.middleName, type, generateLogin]);

    useEffect(() => {
        if (isOpen && type === 'group') {
            const fetchCurators = async () => {
                try {
                    const response = await api.get('/curator');
                    setCurators(response.data);
                } catch {
                    setMessage({ type: 'error', text: 'Ошибка при загрузке кураторов' });
                }
            };
            fetchCurators();
        }
    }, [isOpen, type]);

    useEffect(() => {
        if (isOpen && type === 'student') {
            const fetchGroups = async () => {
                try {
                    const response = await api.get('/group/');
                    setGroups(response.data);
                } catch (error) {
                    console.error('Ошибка при получении групп:', error);
                    setMessage({ type: 'error', text: 'Ошибка при загрузке групп' });
                }
            };
            fetchGroups();
        }
    }, [isOpen, type]);

    useEffect(() => {
        const onEsc = (e) => e.key === 'Escape' && handleClose();
        if (isOpen) {
            window.addEventListener('keydown', onEsc);
            modalRef.current?.focus();
        }
        return () => window.removeEventListener('keydown', onEsc);
    }, [isOpen, handleClose]);

    useEffect(() => () => clearTimeout(animationTimeoutRef.current), []);

    const handleAdd = async () => {
        if (type === 'curator') {
            const { firstName, lastName, middleName, login, password } = formData;
            if (!firstName || !lastName || !middleName || !login || !password) {
                return setMessage({ type: 'error', text: 'Все поля должны быть заполнены' });
            }

            try {
                const response = await api.post('/curator/create', {
                    firstName,
                    lastName,
                    patronymic: middleName,
                    login,
                    password,
                });

                setMessage({ type: 'success', text: `Куратор ${response.data.login} успешно создан!` });
                setFormData(prev => ({ ...prev, lastName: '', firstName: '', middleName: '', login: '', password: '' }));
            } catch (err) {
                setMessage({ type: 'error', text: err.response?.data?.detail || 'Ошибка при создании куратора' });
            }
        } else if (type === 'group') {
            const { newGroupName, selectedTeacher } = formData;
            if (!newGroupName || !selectedTeacher) {
                return setMessage({ type: 'error', text: 'Название группы и преподаватель обязательны' });
            }

            const curatorId = parseInt(selectedTeacher, 10);
            if (isNaN(curatorId)) {
                return setMessage({ type: 'error', text: 'Некорректный преподаватель' });
            }

            try {
                const groupData = {
                    name: newGroupName,
                    curator_id: curatorId
                };
                const response = await api.post('/group/create', groupData);

                setMessage({ type: 'success', text: `Группа ${response.data.name} успешно создана!` });
                setFormData(prev => ({ ...prev, newGroupName: '', selectedTeacher: '' }));
            } catch (err) {
                setMessage({ type: 'error', text: err.response?.data?.detail || 'Ошибка при создании группы' });
            }
        } else if (type === 'student') {
            const { firstName, lastName, middleName, selectedGroup, login, password } = formData;

            if (!firstName || !lastName || !middleName || !selectedGroup) {
                return setMessage({ type: 'error', text: 'Все поля должны быть заполнены' });
            }

            try {
                await api.post('/student/create', {
                    firstName,
                    lastName,
                    patronymic: middleName,
                    login,
                    password,
                    group_id: parseInt(selectedGroup, 10)
                });

                setMessage({ type: 'success', text: `Студент ${lastName} ${firstName} ${middleName} успешно добавлен!` });
                setFormData(prev => ({
                    ...prev,
                    lastName: '',
                    firstName: '',
                    middleName: '',
                    selectedGroup: ''
                }));
            } catch (err) {
                setMessage({ type: 'error', text: err.response?.data?.detail || 'Ошибка при добавлении студента' });
            }
        } else if (type === 'exam' || type === 'credits') {
            const { selectedGroup, selectedTeacher, semester, course, discipline, examDate } = formData;

            if (!selectedGroup || !selectedTeacher || !semester || !course || !discipline || !examDate) {
                return setMessage({ type: 'error', text: 'Все поля должны быть заполнены' });
            }
            try {
                const examData = {
                    type,
                    semester: parseInt(semester, 10),
                    course: parseInt(course, 10),
                    discipline,
                    holding_date: examDate,
                    group_id: parseInt(selectedGroup, 10),
                    curator_id: parseInt(selectedTeacher, 10)
                };

                const response = await api.post('/exam/create', examData);

                setMessage({ type: 'success', text: `Экзамен по дисциплине ${response.data.discipline} успешно добавлен!` });
                setFormData(prev => ({
                    ...prev,
                    semester: '',
                    course: '',
                    discipline: '',
                    selectedGroup: '',
                    selectedTeacher: '',
                    examDate: ''
                }));
            } catch (err) {
                setMessage({ type: 'error', text: err.response?.data?.detail || 'Ошибка при добавлении экзамена' });
            }
        }
    };

    useEffect(() => {
        if (isOpen && (type === 'exam' || type === 'credits')) {
            const fetchData = async () => {
                try {
                    const [groupsRes, curatorsRes] = await Promise.all([
                        api.get('/group/'),
                        api.get('/curator/')
                    ]);
                    setGroups(groupsRes.data);
                    setCurators(curatorsRes.data);
                } catch (error) {
                    setMessage({ type: 'error', text: 'Ошибка при загрузке данных' });
                }
            };
            fetchData();
        }
    }, [isOpen, type]);

    if (!isOpen && !isClosing) return null;

    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'transparent',
            borderColor: state.isFocused ? '#3b82f6' : '#1e293b',
            borderRadius: '1rem',
            padding: '0.1rem',
            color: '#fefefe',
            fontSize: '0.875rem',
            boxShadow: state.isFocused ? '0 0 8px rgba(0, 0, 0, 0.2)' : 'none',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#fefefe',
            fontSize: '0.875rem',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#94a3b8',
            fontSize: '0.875rem',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: '#0f172a',
            borderRadius: '0.75rem',
            padding: '4px',
            zIndex: 1009,
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#1e40af' : '#0f172a',
            color: '#fefefe',
            padding: '8px 12px',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
        }),
        input: (provided) => ({
            ...provided,
            color: '#fefefe',
            fontSize: '0.875rem',
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            color: '#94a3b8',
            padding: '0 8px',
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 2000,
        }),
    };

    return (
        <div className={`${styles.modalContainer} ${isClosing ? styles.closing : ''}`}>
            <div className={styles.backdrop} onClick={handleClose} />
            <div
                className={styles.modal}
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-labelledby="modal-title"
                aria-modal="true"
                tabIndex={-1}
            >
                <div className={styles.modalHeader}>
                    <div>
                        <h2 id="modal-title" className={styles.modalTitle}>{title}</h2>
                        <p className={styles.modalDescription}>{description}</p>
                    </div>
                    <button className={styles.closeButton} onClick={handleClose} aria-label="Закрыть">×</button>
                </div>

                <div className={styles.modalContent}>
                    {type === 'student' ? (
                        <>
                            <Input
                                label="Фамилия"
                                value={formData.lastName}
                                onChange={handleChange('lastName')}
                                placeholder="Введите фамилию"
                            />
                            <Input
                                label="Имя"
                                value={formData.firstName}
                                onChange={handleChange('firstName')}
                                placeholder="Введите имя"
                            />
                            <Input
                                label="Отчество"
                                value={formData.middleName}
                                onChange={handleChange('middleName')}
                                placeholder="Введите отчество"
                            />
                            <label className={styles.label}>Группа</label>
                            <Select
                                options={groups.map(group => ({ value: group.group_id, label: group.name }))}
                                value={groups.find(g => g.group_id === parseInt(formData.selectedGroup)) ? { value: formData.selectedGroup, label: groups.find(g => g.group_id === parseInt(formData.selectedGroup)).name } : null}
                                onChange={(selected) => setFormData(prev => ({ ...prev, selectedGroup: selected ? selected.value : '' }))}
                                placeholder="Выберите группу"
                                isClearable
                                styles={customSelectStyles}
                                menuPortalTarget={document.body}
                                menuPosition="absolute"
                                menuPlacement="auto"
                            />
                        </>
                    ) : type === 'group' ? (
                        <>
                            <Input
                                label="Название новой группы"
                                value={formData.newGroupName}
                                onChange={handleChange('newGroupName')}
                                placeholder="Введите название группы"
                            />
                            <label className={styles.label}>Преподаватель</label>
                            <Select
                                options={curators.map(c => ({ value: c.curator_id, label: `${c.lastName} ${c.firstName} ${c.patronymic}` }))}
                                value={curators.find(c => c.curator_id === parseInt(formData.selectedTeacher)) ? { value: formData.selectedTeacher, label: curators.find(c => c.curator_id === parseInt(formData.selectedTeacher)).lastName + ' ' + curators.find(c => c.curator_id === parseInt(formData.selectedTeacher)).firstName } : null}
                                onChange={(selected) => setFormData(prev => ({ ...prev, selectedTeacher: selected ? selected.value : '' }))}
                                placeholder="Выберите преподавателя"
                                isClearable
                                styles={customSelectStyles}
                                menuPortalTarget={document.body}
                                menuPosition="absolute"
                                menuPlacement="auto"
                            />
                        </>
                    ) : type === 'exam' || type === 'credits' ? (
                        <>
                            <label className={styles.label}>Группа</label>
                            <Select
                                options={groups.map(group => ({ value: group.group_id, label: group.name }))}
                                value={groups.find(g => g.group_id === parseInt(formData.selectedGroup)) ? { value: formData.selectedGroup, label: groups.find(g => g.group_id === parseInt(formData.selectedGroup)).name } : null}
                                onChange={(selected) => setFormData(prev => ({ ...prev, selectedGroup: selected ? selected.value : '' }))}
                                placeholder="Выберите группу"
                                isClearable
                                styles={customSelectStyles}
                                menuPortalTarget={document.body}
                                menuPosition="absolute"
                                menuPlacement="auto"
                            />
                            <div className={styles.inputRow}>
                                <div className={styles.halfInputGroup}>
                                    <label className={styles.label}>Семестр</label>
                                    <Select
                                        options={semesters.map(s => ({ value: s, label: `${s}` }))}
                                        value={semesters.includes(parseInt(formData.semester)) ? { value: formData.semester, label: formData.semester } : null}
                                        onChange={(selected) => setFormData(prev => ({ ...prev, semester: selected ? selected.value : '' }))}
                                        placeholder="Выберите семестр"
                                        isClearable
                                        styles={customSelectStyles}
                                        menuPortalTarget={document.body}
                                        menuPosition="absolute"
                                        menuPlacement="auto"
                                    />
                                </div>
                                <div className={styles.halfInputGroup}>
                                    <label className={styles.label}>Курс</label>
                                    <Select
                                        options={courses.map(c => ({ value: c, label: `${c}` }))}
                                        value={courses.includes(parseInt(formData.course)) ? { value: formData.course, label: formData.course } : null}
                                        onChange={(selected) => setFormData(prev => ({ ...prev, course: selected ? selected.value : '' }))}
                                        placeholder="Выберите курс"
                                        isClearable
                                        styles={customSelectStyles}
                                        menuPortalTarget={document.body}
                                        menuPosition="absolute"
                                        menuPlacement="auto"
                                    />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Дисциплина</label>
                                <Select
                                    options={disciplines.map(d => ({ value: d, label: d }))}
                                    value={disciplines.includes(formData.discipline) ? { value: formData.discipline, label: formData.discipline } : null}
                                    onChange={(selected) => setFormData(prev => ({ ...prev, discipline: selected ? selected.value : '' }))}
                                    placeholder="Выберите дисциплину"
                                    isClearable
                                    styles={customSelectStyles}
                                    menuPortalTarget={document.body}
                                    menuPosition="absolute"
                                    menuPlacement="auto"
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Преподаватель</label>
                                <Select
                                    options={curators.map(c => ({ value: c.curator_id, label: `${c.lastName} ${c.firstName} ${c.patronymic}` }))}
                                    value={curators.find(c => c.curator_id === parseInt(formData.selectedTeacher)) ? { value: formData.selectedTeacher, label: curators.find(c => c.curator_id === parseInt(formData.selectedTeacher)).lastName + ' ' + curators.find(c => c.curator_id === parseInt(formData.selectedTeacher)).firstName } : null}
                                    onChange={(selected) => setFormData(prev => ({ ...prev, selectedTeacher: selected ? selected.value : '' }))}
                                    placeholder="Выберите преподавателя"
                                    isClearable
                                    styles={customSelectStyles}
                                    menuPortalTarget={document.body}
                                    menuPosition="absolute"
                                    menuPlacement="auto"
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Дата проведения экзамена</label>
                                <input
                                    type="date"
                                    className={styles.inputField}
                                    value={formData.examDate}
                                    onChange={handleChange('examDate')}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <Input
                                label="Фамилия"
                                value={formData.lastName}
                                onChange={handleChange('lastName')}
                                placeholder="Введите фамилию"
                            />
                            <Input
                                label="Имя"
                                value={formData.firstName}
                                onChange={handleChange('firstName')}
                                placeholder="Введите имя"
                            />
                            <Input
                                label="Отчество"
                                value={formData.middleName}
                                onChange={handleChange('middleName')}
                                placeholder="Введите отчество"
                            />
                            <Input
                                label="Логин"
                                value={formData.login}
                                onChange={handleChange('login')}
                                placeholder="Введите логин"
                            />
                        </>
                    )}

                    {message.text && (
                        <p className={message.type === 'success' ? styles.success : styles.error}>{message.text}</p>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.addFooterButton} onClick={handleAdd}>Добавить</button>
                </div>
            </div>
        </div>
    );
};

const Input = ({ label, value, onChange, placeholder }) => (
    <div className={styles.inputGroup}>
        <label className={styles.label}>{label}</label>
        <input className={styles.inputField} value={value} onChange={onChange} placeholder={placeholder} />
    </div>
);

export default Modal;