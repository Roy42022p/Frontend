import React, { useCallback, useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import styles from './AssignGradesModal.module.css';
import api from '../../../api';

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
    indicatorSeparator: () => ({ display: 'none' }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 2000,
    }),
};

const gradeOptions = [
    { value: 'н/а', label: 'н/а' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
];

const AssignGradesModal = ({ exam, onClose, title, description }) => {
    const [isClosing, setIsClosing] = useState(false);
    const animationTimeoutRef = useRef(null);
    const modalRef = useRef(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [grades, setGrades] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        animationTimeoutRef.current = setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300);
    }, [onClose]);

    useEffect(() => {
        const onEsc = (e) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        window.addEventListener('keydown', onEsc);
        modalRef.current?.focus();

        return () => {
            window.removeEventListener('keydown', onEsc);
            clearTimeout(animationTimeoutRef.current);
        };
    }, [handleClose]);

    useEffect(() => {
        if (!exam) return;

        const fetchStudents = async () => {
            setLoading(true);
            try {
                const res = await api.get(`student/${exam.group_id}/students/`, {
                    params: { exam_id: exam.id }
                });
                setStudents(res.data);
                const initialGrades = {};
                res.data.forEach(student => {
                    initialGrades[student.id] = student.grade !== null && student.grade !== undefined
                        ? String(student.grade)
                        : 'н/а';
                });
                setGrades(initialGrades);
                setError(null);
            } catch (err) {
                console.error(err);
                setError('Ошибка при получении студентов');
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [exam]);

    const handleGradeChange = (studentId, selectedOption) => {
        setGrades(prev => ({
            ...prev,
            [studentId]: selectedOption ? selectedOption.value : 'н/а',
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveError(null);
        setSaveSuccess(false);
        try {
            const gradesArray = Object.entries(grades).map(([studentId, mark]) => ({
                student_id: Number(studentId),
                exam_id: exam.id,
                mark: mark === 'н/а' ? '' : String(mark),
            }));

            await api.patch('mark/batch', { marks: gradesArray });

            setSaveSuccess(true);
        } catch (err) {
            console.error(err);
            setSaveError('Ошибка при сохранении оценок');
        } finally {
            setSaving(false);
        }
    };

    const renderTable = () => {
        if (loading) return <div className={styles.loading}>Загрузка...</div>;
        if (error) return <div className={styles.error}>{error}</div>;

        return (
            <table className={styles.table}>
                <thead className={styles.thead}>
                <tr>
                    <th>ФИО</th>
                    <th>Оценка</th>
                </tr>
                </thead>
                <tbody>
                {students.map(student => (
                    <tr key={student.id}>
                        <td>{`${student.lastName} ${student.firstName} ${student.patronymic}`}</td>
                        <td>
                            <Select
                                options={gradeOptions}
                                value={gradeOptions.find(option => option.value === grades[student.id])}
                                onChange={(selected) => handleGradeChange(student.id, selected)}
                                styles={customSelectStyles}
                                placeholder="Выберите..."
                                isClearable
                                menuPortalTarget={document.body}
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        );
    };

    return (
        <div
            className={`${styles.backdrop} ${isClosing ? styles.closing : ''}`}
            onClick={handleClose}
            ref={modalRef}
        >
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div className={styles.modalHeader}>
                    <div>
                        <h2 id="modal-title" className={styles.modalTitle}>
                            {title}
                        </h2>
                        <p className={styles.modalDescription}>{description}</p>
                    </div>
                    <button
                        className={styles.closeButton}
                        onClick={handleClose}
                        aria-label="Закрыть"
                    >
                        ×
                    </button>
                </div>
                <div className={styles.tableContainer}>{renderTable()}</div>
                <div className={styles.actions}>
                    <button
                        className={styles.saveButton}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Сохраняем...' : 'Сохранить'}
                    </button>
                    {saveError && <div className={styles.error}>{saveError}</div>}
                    {saveSuccess && <div className={styles.success}>Оценки успешно сохранены</div>}
                </div>
            </div>
        </div>
    );
};

export default AssignGradesModal;
