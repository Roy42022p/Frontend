import React, { useState, useEffect, useMemo } from 'react';
import HeaderEl from "../global/headerEl/HeaderEl";
import Modal from "../global/AddModal/AddModal";
import api from '../../api';
import styles from './Curators.module.css';
import EditModal from "../global/EditModal/EditModal";
import * as XLSX from 'xlsx';

const Curators = () => {
    const [showModal, setShowModal] = useState(false);
    const [curators, setCurators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [editModal, setEditModal] = useState(false);
    const [editedCurator, setEditedCurator] = useState(null);
    const [, setImportedData] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/curator');
            setCurators(res.data);
        } catch {
            setError('Ошибка при загрузке данных');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return curators;
        return curators.filter(c => {
            const groupsText = Array.isArray(c.groups)
                ? c.groups.map(g => g.name || g).join(' ')
                : '';
            const allFields = [
                c.lastName,
                c.firstName,
                c.patronymic,
                c.login,
                c.password,
                groupsText
            ].join(' ').toLowerCase();
            return allFields.includes(q);
        });
    }, [curators, searchQuery]);

    const handleEditClick = (curator) => {
        setEditedCurator(curator);
        setEditModal(true);
    };

    const handleEditChange = (key, value) => {
        setEditedCurator({ ...editedCurator, [key]: value });
    };

    const handleEditSave = async () => {
        try {
            await api.patch(`/curator/update/${editedCurator.curator_id}`, editedCurator);
            setCurators(prev =>
                prev.map(c =>
                    c.curator_id === editedCurator.curator_id ? { ...c, ...editedCurator } : c
                )
            );
            setEditModal(false);
        } catch {
            alert("Не удалось сохранить изменения");
        }
    };

    const handleDeleteCurator = async () => {
        if (!editedCurator) return;

        try {
            await api.delete(`/curator/delete/${editedCurator.curator_id}`);
            setCurators(prev => prev.filter(c => c.curator_id !== editedCurator.curator_id));
            setEditModal(false);
        } catch (error) {
            alert('Не удалось удалить преподавателя');
            console.error('Delete error:', error);
        }
    };

    const handleExport = () => {
        const exportData = filtered.map((c, i) => ({
            '#': i + 1,
            'Фамилия': c.lastName || '-',
            'Имя': c.firstName || '-',
            'Отчество': c.patronymic || '-',
            'Группы': Array.isArray(c.groups) ? c.groups.map(g => g.name || g).join(', ') : '-',
            'Логин': c.login || '-',
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Преподаватели');
        XLSX.writeFile(workbook, 'Преподаватели.xlsx');
    };

    const handleImport = async (data) => {
        setImportedData(data);
        try {
            const curatorsData = data.map(item => {
                const full_name = item['ФИО'] ? String(item['ФИО']).trim() : '';
                const groupsRaw = item['Группы'] ? String(item['Группы']).trim() : '';
                const login = item['Логин'] ? String(item['Логин']).trim() : '';
                const password = item['Пароль'] ? String(item['Пароль']).trim() : '';

                const groups = groupsRaw
                    ? groupsRaw.split(',').map(g => g.trim()).filter(Boolean)
                    : [];

                return { full_name, groups, login, password };
            }).filter(s => s.full_name);

            await api.post('/curator/import', curatorsData);
            fetchData();
        } catch (err) {
            console.error('Ошибка импорта:', err);
            alert('Ошибка при импорте данных');
        }
    };

    return (
        <div className={styles.container}>
            <HeaderEl
                header="Список преподавателей"
                title="Управляйте всеми преподавателями в системе."
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                buttons="curators"
                setShowModal={setShowModal}
                type="curator"
                onExport={handleExport}
                onImport={handleImport}
            />

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    fetchData();
                }}
                title="Добавить нового преподавателя"
                description="Заполните форму для создания нового аккаунта преподавателя."
                type="curator"
            />

            {loading && <p>Загрузка...</p>}
            {error && <p className={styles.error}>{error}</p>}
            {!loading && !error && filtered.length === 0 && <p>Преподаватели не найдены</p>}

            <div className={styles.tableContainer}>
                {!loading && !error && filtered.length > 0 && (
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                        <tr>
                            <th>#</th>
                            <th>Фамилия</th>
                            <th>Имя</th>
                            <th>Отчество</th>
                            <th>Группы</th>
                            <th>Логин</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map((c, i) => (
                            <tr key={c.login}>
                                <td>{i + 1}</td>
                                <td>{c.lastName}</td>
                                <td>{c.firstName}</td>
                                <td>{c.patronymic}</td>
                                <td>
                                    {Array.isArray(c.groups) && c.groups.length > 0 ? (
                                        c.groups.map((g, index) => (
                                            <span key={index} className={styles.groupBadge}>
                                                {g.name || g}
                                            </span>
                                        ))
                                    ) : (
                                        '-'
                                    )}
                                </td>
                                <td>{c.login || '-'}</td>
                                <td>
                                    <button
                                        className={styles.actionButton}
                                        onClick={() => handleEditClick(c)}
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
                data={editedCurator || {}}
                onChange={handleEditChange}
                onSave={handleEditSave}
                type="curator"
                onDelete={handleDeleteCurator}
            />
        </div>
    );
};

export default Curators;
