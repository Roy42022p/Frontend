import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { IMaskInput } from 'react-imask';
import Select from 'react-select';
import styles from './EditModal.module.css';

const LABELS = {
    firstName: 'Имя',
    lastName: 'Фамилия',
    patronymic: 'Отчество',
    group_id: 'Группа',
    telephone: 'Телефон',
    dateOfBirth: 'Дата рождения',
    mail: 'Email',
    snils: 'СНИЛС',
    login: 'Логин',
    name: 'Название',
    curator_id: 'Преподаватель'
};

const TYPE_FIELDS = {
    student: ['lastName', 'firstName', 'patronymic', 'group_id', 'telephone', 'dateOfBirth', 'mail', 'snils'],
    curator: ['lastName', 'firstName', 'patronymic', 'login'],
    group: ['name', 'curator_id']
};

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

const EditModal = ({ isOpen, onClose, data, onChange, onSave, onDelete, groups = {}, curators = [], type }) => {
    const [isClosing, setIsClosing] = useState(false);
    const modalRef = useRef(null);
    const animationTimeoutRef = useRef(null);
    const [errors, setErrors] = useState({});

    const fieldHandlers = useMemo(() => {
        return TYPE_FIELDS[type].reduce((acc, key) => {
            acc[key] = (e) => onChange(key, e.target.value);
            return acc;
        }, {});
    }, [type, onChange]);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        animationTimeoutRef.current = setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300);
    }, [onClose]);

    useEffect(() => {
        const onEsc = (e) => e.key === 'Escape' && handleClose();
        if (isOpen) {
            window.addEventListener('keydown', onEsc);
        }
        return () => {
            window.removeEventListener('keydown', onEsc);
            clearTimeout(animationTimeoutRef.current);
        };
    }, [isOpen, handleClose]);

    const fields = TYPE_FIELDS[type] || [];

    const fullName = type === 'curator'
        ? `${data.lastName || ''} ${data.firstName || ''} ${data.patronymic || ''}`.trim()
        : '';

    const validate = () => {
        const newErrors = {};
        const snilsPattern = /^\d{3}-\d{3}-\d{3} \d{2}$/;
        const phonePattern = /^\+7-\(\d{3}\)-\d{3}-\d{2}-\d{2}$/;

        if (fields.includes('snils') && data.snils && !snilsPattern.test(data.snils)) {
            newErrors.snils = 'Неверный формат СНИЛС. Пример: 123-456-789 12';
        }
        if (fields.includes('telephone') && data.telephone && !phonePattern.test(data.telephone)) {
            newErrors.telephone = 'Неверный формат номера. Пример: +7-(495)-555-32-32';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveClick = () => {
        if (validate()) {
            onSave();
        }
    };

    const handleDeleteClick = () => {
        onDelete();
        handleClose();
    };

    return (isOpen || isClosing) ? (
        <div className={`${styles.modalContainer} ${isClosing ? styles.closing : ''}`}>
            <div className={styles.backdrop} onClick={handleClose}></div>
            <div className={styles.modal} ref={modalRef} tabIndex={-1}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Редактировать</h3>
                    {type === 'curator' && (
                        <p className={styles.modalDescription}>
                            Заполните форму для обновления данных преподавателя "{fullName}".
                        </p>
                    )}
                    <button className={styles.closeButton} onClick={handleClose}>✕</button>
                </div>

                <div className={styles.modalContent}>
                    {fields.map(key => {
                        const value = data[key] || '';
                        const error = errors[key];

                        if (key === 'group_id' || key === 'curator_id') {
                            const options = key === 'group_id'
                                ? Object.entries(groups).map(([id, name]) => ({ value: id, label: name }))
                                : curators.map(c => ({ value: c.curator_id, label: `${c.lastName} ${c.firstName}` }));

                            return (
                                <div key={key} className={styles.inputGroup}>
                                    <label className={styles.label}>{LABELS[key]}</label>
                                    <Select
                                        options={options}
                                        value={options.find(o => o.value === value) || null}
                                        onChange={(selected) => onChange(key, selected ? selected.value : '')}
                                        placeholder="Выберите..."
                                        isClearable
                                        styles={customSelectStyles}
                                        menuPortalTarget={document.body}
                                        menuPosition="absolute"
                                        menuPlacement="auto"
                                    />

                                </div>
                            );
                        }

                        if (key === 'telephone') {
                            return (
                                <div key={key} className={styles.inputGroup}>
                                    <label className={styles.label}>{LABELS[key]}</label>
                                    <IMaskInput
                                        mask="+7-(000)-000-00-00"
                                        value={value}
                                        onAccept={(val) => onChange(key, val)}
                                        className={styles.inputField}
                                        placeholder="+7-(495)-555-32-32"
                                    />
                                    {error && <p className={styles.error}>{error}</p>}
                                </div>
                            );
                        }

                        if (key === 'snils') {
                            return (
                                <div key={key} className={styles.inputGroup}>
                                    <label className={styles.label}>{LABELS[key]}</label>
                                    <IMaskInput
                                        mask="000-000-000 00"
                                        value={value}
                                        onAccept={(val) => onChange(key, val)}
                                        className={styles.inputField}
                                        placeholder="123-456-789 12"
                                    />
                                    {error && <p className={styles.error}>{error}</p>}
                                </div>
                            );
                        }

                        return (
                            <div key={key} className={styles.inputGroup}>
                                <label className={styles.label}>{LABELS[key]}</label>
                                <input
                                    className={styles.inputField}
                                    type={key === 'dateOfBirth' ? 'date' : 'text'}
                                    value={value}
                                    onChange={fieldHandlers[key]}
                                />
                                {error && <p className={styles.error}>{error}</p>}
                            </div>
                        );
                    })}
                </div>

                <div className={styles.actions}>
                    <button className={styles.deleteButton} onClick={handleDeleteClick}>Удалить</button>
                    <button className={styles.addFooterButton} onClick={handleSaveClick} disabled={Object.keys(errors).length > 0}>Сохранить</button>
                    <button className={styles.addFooterButton} onClick={handleClose}>Отмена</button>
                </div>
            </div>
        </div>
    ) : null;
};

export default EditModal;
