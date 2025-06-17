import React, { useState, useEffect, useMemo } from 'react';
import HeaderEl from "../global/headerEl/HeaderEl";
import Modal from "../global/AddModal/AddModal";
import EditModal from "../global/EditModal/EditModal";
import api from '../../api';
import styles from './Students.module.css';
import * as XLSX from 'xlsx';

const Students = () => {
    const [showModal, setShowModal] = useState(false);
    const [students, setStudents] = useState([]);
    const [groups, setGroups] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editModal, setEditModal] = useState(false);
    const [editedStudent, setEditedStudent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [, setImportedData] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const gr = await api.get('/group');
            const groupMap = gr.data.reduce((m, g) => {
                m[g.group_id] = g.name;
                return m;
            }, {});
            setGroups(groupMap);
            const st = await api.get('/student');
            setStudents(st.data);
            setLoading(false);
        } catch (e) {
            setError('Ошибка при загрузке данных');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEditClick = (s) => {
        setEditedStudent(s);
        setEditModal(true);
    };

    const handleEditChange = (k, v) => {
        setEditedStudent({ ...editedStudent, [k]: v });
    };

    const handleEditSave = async () => {
        try {
            await api.patch(`/student/update/${editedStudent.id}`, editedStudent);
            setStudents(prev =>
                prev.map(s => (s.id === editedStudent.id ? { ...s, ...editedStudent } : s))
            );
            setEditModal(false);
        } catch {
            alert('Не удалось сохранить изменения');
        }
    };

    const handleDelete = async () => {
        if (!editedStudent?.id) return;
        try {
            await api.delete(`/student/delete/${editedStudent.id}`);
            setStudents(prev => prev.filter(s => s.id !== editedStudent.id));
            setEditModal(false);
        } catch (err) {
            alert('Не удалось удалить студента');
            console.error(err);
        }
    };

    const handleExport = () => {
        const exportData = filtered.map((s, i) => ({
            '#': i + 1,
            'ФИО': `${s.lastName} ${s.firstName} ${s.patronymic}`,
            'Статус': s.verif ? 'Зарегистрирован' : 'Не зарегистрирован',
            'Группа': groups[s.group_id] || '-',
            'Телефон': s.telephone || '-',
            'Дата рождения': s.dateOfBirth || '-',
            'Email': s.mail || '-',
            'СНИЛС': s.snils || '-'
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Студенты');
        XLSX.writeFile(workbook, 'Студенты.xlsx');
    };

    const filtered = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return students;

        return students.filter(s => {
            const fields = [
                s.lastName,
                s.firstName,
                s.patronymic,
                s.telephone,
                s.mail,
                s.snils,
                s.dateOfBirth,
                groups[s.group_id],
                s.verif ? 'зарегистрирован' : 'не зарегистрирован'
            ];

            return fields.some(field =>
                field?.toString().toLowerCase().includes(query)
            );
        });
    }, [students, searchQuery, groups]);

    const handleImport = async (data) => {
        setImportedData(data);
        try {
            const studentsData = data.map(item => {
                const full_name = item['ФИО'] ? String(item['ФИО']).trim() : '';
                const group_name = item['Группа'] ? String(item['Группа']).trim() : '';

                return { full_name, group_name };
            }).filter(s => s.full_name && s.group_name);

            await api.post('/student/import', studentsData);
            fetchData();
        } catch (err) {
            console.error('Ошибка импорта:', err);
            alert('Ошибка при импорте данных');
        }
    };

    return (
        <div className={styles.container}>
            <HeaderEl
                header="Список студентов"
                title="Управляйте всеми студентами в системе."
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                setShowModal={setShowModal}
                type="student"
                onExport={handleExport}
                onImport={handleImport}
            />
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    fetchData();
                }}
                title="Добавить нового студента"
                description="Заполните форму для создания нового аккаунта студента."
                type="student"
            />
            {loading && <p>Загрузка...</p>}
            {error && <p className={styles.error}>{error}</p>}
            {!loading && !error && filtered.length === 0 && <p>Студенты не найдены</p>}
            <div className={styles.tableContainer}>
                {!loading && !error && filtered.length > 0 && (
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                        <tr>
                            <th>#</th>
                            <th>ФИО</th>
                            <th>Статус</th>
                            <th>Группа</th>
                            <th>Телефон</th>
                            <th>Дата рождения</th>
                            <th>Email</th>
                            <th>СНИЛС</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map((s, i) => (
                            <tr key={s.id}>
                                <td>{i + 1}</td>
                                <td>{`${s.lastName} ${s.firstName} ${s.patronymic}`}</td>
                                <td>
                                        <span className={s.verif ? styles.registered : styles.notRegistered}>
                                            {s.verif ? 'Зарегистрирован' : 'Не зарегистрирован'}
                                        </span>
                                </td>
                                <td>{groups[s.group_id] || '-'}</td>
                                <td>{s.telephone || '-'}</td>
                                <td>{s.dateOfBirth || '-'}</td>
                                <td>{s.mail || '-'}</td>
                                <td>{s.snils || '-'}</td>
                                <td>
                                    <button
                                        className={styles.actionButton}
                                        onClick={() => handleEditClick(s)}
                                    >
                                        …
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
            <EditModal
                isOpen={editModal}
                onClose={() => setEditModal(false)}
                data={editedStudent || {}}
                onChange={handleEditChange}
                onSave={handleEditSave}
                onDelete={handleDelete}
                groups={groups}
                type="student"
            />
        </div>
    );
};

export default Students;
