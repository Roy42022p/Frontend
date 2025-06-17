import React, { useState, useEffect, useMemo } from 'react';
import HeaderEl from "../global/headerEl/HeaderEl";
import Modal from "../global/AddModal/AddModal";
import EditModal from "../global/EditModal/EditModal";
import api from '../../api';
import styles from './Groups.module.css';
import * as XLSX from 'xlsx';

const Groups = () => {
    const [showModal, setShowModal] = useState(false);
    const [groups, setGroups] = useState([]);
    const [curators, setCurators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [editModal, setEditModal] = useState(false);
    const [editedGroup, setEditedGroup] = useState(null);
    const [, setImportedData] = useState([]);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const [groupsRes, curatorsRes] = await Promise.all([
                api.get('/group'),
                api.get('/curator')
            ]);
            setCurators(curatorsRes.data);
            const curatorsMap = curatorsRes.data.reduce((acc, curator) => {
                acc[curator.curator_id] = curator;
                return acc;
            }, {});
            const groupsWithCurators = groupsRes.data.map(group => ({
                ...group,
                curator: curatorsMap[group.curator_id] || null
            }));
            setGroups(groupsWithCurators);
        } catch {
            setError('Ошибка при загрузке данных');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return groups;

        return groups.filter(group => {
            const curatorFullName = group.curator
                ? `${group.curator.lastName} ${group.curator.firstName} ${group.curator.patronymic || ''}`.toLowerCase()
                : '';

            const groupName = group.name?.toLowerCase() || '';
            const studentsCount = group.students_count?.toString() || '';

            return (
                groupName.includes(q) ||
                curatorFullName.includes(q) ||
                studentsCount.includes(q)
            );
        });
    }, [groups, searchQuery]);


    const handleEditClick = (group) => {
        setEditedGroup({
            group_id: group.group_id,
            name: group.name,
            curator_id: group.curator_id
        });
        setEditModal(true);
    };

    const handleEditChange = (key, value) => {
        setEditedGroup({ ...editedGroup, [key]: value });
    };

    const handleEditSave = async () => {
        try {
            await api.patch(`/group/update/${editedGroup.group_id}`, editedGroup);
            setGroups(prev =>
                prev.map(g =>
                    g.group_id === editedGroup.group_id
                        ? { ...g, ...editedGroup, curator: curators.find(c => c.curator_id === editedGroup.curator_id) || null }
                        : g
                )
            );
            setEditModal(false);
        } catch {
            alert("Не удалось сохранить изменения");
        }
    };

    const handleDeleteGroup = async () => {
        if (!editedGroup) return;

        try {
            await api.delete(`/group/delete/${editedGroup.group_id}`);
            setGroups(prev => prev.filter(g => g.group_id !== editedGroup.group_id));
            setEditModal(false);
        } catch (error) {
            alert('Не удалось удалить группу');
            console.error('Delete error:', error);
        }
    };

    const handleExport = () => {
        const exportData = filtered.map((group, i) => ({
            '#': i + 1,
            'Название группы': group.name,
            'Куратор': group.curator ? `${group.curator.lastName} ${group.curator.firstName}` : '-',
            'Кол-во студентов': group.students_count
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Группы');
        XLSX.writeFile(workbook, 'Группы.xlsx');
    };

    const handleImport = async (data) => {
        setImportedData(data);
        try {
            const groupsData = data.map(item => {
                const name = item['Название группы'] ? String(item['Название группы']).trim() : '';
                const curator_full_name = item['ФИО куратора'] ? String(item['ФИО куратора']).trim() : '';

                return { name, curator_full_name };
            }).filter(g => g.name && g.curator_full_name);

            await api.post('/group/import', groupsData);

            fetchGroups();
        } catch (err) {
            console.error('Ошибка импорта групп:', err);
            alert('Ошибка при импорте групп');
        }
    };


    return (
        <div className={styles.container}>
            <HeaderEl
                header="Список групп"
                title="Управляйте всеми группами в системе."
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                buttons="groups"
                setShowModal={setShowModal}
                type="group"
                onExport={handleExport}
                onImport={handleImport}
            />

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    fetchGroups();
                }}
                title="Добавить новую группу"
                description="Заполните форму для создания новой группы."
                type="group"
            />

            {loading && <p>Загрузка...</p>}
            {error && <p className={styles.error}>{error}</p>}
            {!loading && !error && filtered.length === 0 && <p>Группы не найдены</p>}

            <div className={styles.tableContainer}>
                {!loading && !error && filtered.length > 0 && (
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                        <tr>
                            <th>#</th>
                            <th>Название</th>
                            <th>Преподаватель</th>
                            <th>Кол-во студентов</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map((g, i) => (
                            <tr key={g.group_id}>
                                <td>{i + 1}</td>
                                <td>{g.name}</td>
                                <td>{g.curator ? `${g.curator.lastName} ${g.curator.firstName}` : '-'}</td>
                                <td>{g.students_count}</td>
                                <td>
                                    <button
                                        className={styles.actionButton}
                                        onClick={() => handleEditClick(g)}
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
                data={editedGroup || {}}
                onChange={handleEditChange}
                onSave={handleEditSave}
                curators={curators}
                type="group"
                onDelete={handleDeleteGroup}
            />
        </div>
    );
};

export default Groups;
