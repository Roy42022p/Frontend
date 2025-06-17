import React, {useEffect, useMemo, useState, useRef, useCallback} from 'react';
import HeaderEl from "../global/headerEl/HeaderEl";
import Modal from "../global/AddModal/AddModal";
import styles from "./Exams.module.css";
import api from "../../api";
import AssignGradesModal from "../global/AssignGradesModal/AssignGradesModal";
import AttachTicketsModal from "../global/AttachTicketsModal/AttachTicketsModal";
import { Link } from 'react-router-dom';

const Exams = ({type}) => {
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [showAssignGradesModal, setShowAssignGradesModal] = useState(false);
    const [selectedExamForGrades, setSelectedExamForGrades] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });
    const dropdownRef = useRef(null);
    const [groups, setGroups] = useState([]);
    const [showAttachTicketsModal, setShowAttachTicketsModal] = useState(false);
    const [selectedExamForTickets, setSelectedExamForTickets] = useState(null);
    const [, setIsDeleting] = useState(false);

    const fetchExams = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/exam', {
                params: { exam_type: type }
            });
            const examData = res.data;
            setGroups([]);
            examData.forEach(element => {
                setGroups(prevList => [...prevList, element.group_name]);
            });
            setExams(examData);
        } catch {
            setError('Ошибка при загрузке экзаменов');
        } finally {
            setLoading(false);
        }
    }, [type]);

    useEffect(() => {
        fetchExams();
    }, [fetchExams]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (openDropdownId) {
                setOpenDropdownId(null);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [openDropdownId]);

    const handleSetGrades = (exam) => {
        setSelectedExamForGrades(exam);
        setShowAssignGradesModal(true);
        setOpenDropdownId(null);
    };

    const handleAttachTickets = (exam) => {
        setSelectedExamForTickets(exam);
        setShowAttachTicketsModal(true);
        setOpenDropdownId(null);
    };

    const filtered = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        return exams.filter(exam => {
            const examDate = new Date(exam.holding_date);

            const matchesSearch = Object.values(exam).some(value =>
                (typeof value === 'string' || typeof value === 'number') &&
                String(value).toLowerCase().includes(query)
            );

            const matchesGroup = filterStatus === 'all' || exam.group_name === filterStatus;

            const matchesDate =
                (!start || examDate >= start) &&
                (!end || examDate <= end);

            return matchesSearch && matchesGroup && matchesDate;
        });
    }, [exams, searchQuery, filterStatus, startDate, endDate]);


    const saveTicketsLink = async () => {
        await fetchExams();
    };

    const handleMenuPosition = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setMenuPosition({
            left: rect.left + window.scrollX,
            top: rect.bottom + window.scrollY
        });
    };

    const handleDeleteExam = async (exam) => {

        try {
            setIsDeleting(true);
            await api.delete(`/exam/delete/${exam.id}`);
            setExams(prev => prev.filter(e => e.id !== exam.id));
            setOpenDropdownId(null);
        } catch (error) {
            if (error.response?.status === 409) {
                alert('Нельзя удалить экзамен, для которого уже выставлены оценки');
            } else {
                alert('Не удалось удалить экзамен');
            }
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className={styles.container}>
            <HeaderEl
                header={`${type === 'credits' ? 'Зачёты' : 'Экзамены'}`}
                title={`Управляйте ${type === 'credits' ? 'зачётами' : 'экзаменами'} в системе.`}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                setShowModal={setShowModal}
                type="exams"
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
                startDate={startDate}
                endDate={endDate}
                onDateChange={(start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                }}
                groups={groups}
                addButtonText={type === 'credits' ? 'Добавить зачёт' : 'Добавить экзамен'}
            />

            {loading && <p>Загрузка...</p>}
            {error && <p className={styles.error}>{error}</p>}
            {!loading && !error && filtered.length === 0 && (
                <p>{type === 'credits' ? 'Зачёты не найдены' : 'Экзамены не найдены'}</p>
            )}


            <div className={styles.tableContainer}>
                {!loading && !error && filtered.length > 0 && (
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                        <tr>
                            <th>#</th>
                            <th>Дисциплина</th>
                            <th>Дата</th>
                            <th>Преподаватель</th>
                            <th>Группа</th>
                            <th>Ссылка на билеты</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map((exam, i) => (
                            <tr key={exam.id}>
                                <td>{i + 1}</td>
                                <td>{exam.discipline}</td>
                                <td>{new Date(exam.holding_date).toLocaleDateString()}</td>
                                <td>{exam.curator_full_name || '-'}</td>
                                <td>{exam.group_name || '-'}</td>
                                <td>
                                    {exam.link ? (
                                        <a href={exam.link} target="_blank" rel="noopener noreferrer" className={styles.link}>
                                            Перейти
                                        </a>
                                    ) : (
                                        <p className={styles.link}>
                                            Билеты не прикреплены
                                        </p>
                                    )}
                                </td>
                                <td className={styles.actionCell}>
                                    <button
                                        className={styles.actionButton}
                                        onClick={(e) => {
                                            handleMenuPosition(e);
                                            setOpenDropdownId(prev => prev === exam.id ? null : exam.id);
                                        }}
                                    >
                                        …
                                    </button>
                                    {openDropdownId === exam.id && (
                                        <div
                                            className={styles.dropdownMenu}
                                            ref={dropdownRef}
                                            style={{
                                                left: `${menuPosition.left}px`,
                                                top: `${menuPosition.top + 5}px`
                                            }}
                                        >
                                            <p onClick={() => handleSetGrades(exam)} className={styles.dropdownItem}>Выставить оценки</p>
                                            <p onClick={() => handleAttachTickets(exam)} className={styles.dropdownItem}>Прикрепить билеты</p>
                                            <Link
                                                to={`/exam/${exam.id}`}
                                                state={{ discipline: exam.discipline, type: type }}
                                                className={styles.dropdownItem}
                                                onClick={() => setOpenDropdownId(null)}
                                            >
                                                Просмотр оценок
                                            </Link>
                                            <p
                                                onClick={() => handleDeleteExam(exam)}
                                                className={`${styles.dropdownItem} ${styles.deleteItem}`}
                                            >
                                                Удалить экзамен
                                            </p>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    fetchExams();
                }}
                title="Добавить экзамен"
                description="Заполните форму для создания нового экзамена."
                type={type}
            />

            {showAssignGradesModal && (
                <AssignGradesModal
                    exam={selectedExamForGrades}
                    onClose={() => setShowAssignGradesModal(false)}
                    title="Выставление оценок"
                    description="Выберите оценки для студентов и сохраните одним кликом."
                />
            )}

            {showAttachTicketsModal && selectedExamForTickets && (
                <AttachTicketsModal
                    exam={selectedExamForTickets}
                    onClose={() => {
                        setShowAttachTicketsModal(false);
                        fetchExams();
                    }}
                    onSave={saveTicketsLink}
                />
            )}
        </div>
    );
};

export default Exams;
