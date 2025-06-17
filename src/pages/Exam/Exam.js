import React, {useCallback, useEffect, useState} from 'react';
import AdminSidebar from "../../layouts/AdminSidebar/AdminSidebar";
import { useLocation, useParams } from "react-router-dom";
import styles from "./Exam.module.css";
import HeaderEl from "../../components/global/headerEl/HeaderEl";
import api from "../../api";

const Exam = () => {
    const [active, setActive] = useState();
    const { id } = useParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [, setShowModal] = useState(false);
    const location = useLocation();
    const discipline = location.state?.discipline;
    const type = location.state?.type;

    const [marksData, setMarksData] = useState([]);
    const [examDate, setExamDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [fileName, setFilename] = useState("");
    const [, setImportedData] = useState([]);

    const fetchMarks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get(`/exam/${id}/marks`);
            const data = response.data;

            setMarksData(data.students);
            setExamDate(data.holding_date);
            setFilename(`${data.discipline}-${data.holding_date}.docx`);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || "Произошла ошибка при загрузке данных.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchMarks();
    }, [fetchMarks]);

    const filteredMarksData = marksData.filter(student =>
        student.student_full_name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    const handleExport = async () => {
        try {
            const response = await api.get(`/exam/${id}/document`, {
                responseType: 'blob',
            });

            const disposition = response.headers['content-disposition'];
            let filename = fileName;
            if (disposition && disposition.indexOf('filename=') !== -1) {
                const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch.length > 1) {
                    filename = filenameMatch[1];
                }
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            alert('Ошибка при экспорте документа: ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleImport = async (data) => {
        setImportedData(data);
        try {
            const marksData = data.map(item => {
                const last_fist_name = item['Фамилия Имя'] ? String(item['Фамилия Имя']).trim() : '';
                let markRaw = item['Оценка'] ? String(item['Оценка']).trim() : '';
                const mark = (!markRaw || markRaw.toLowerCase() === 'н/а') ? null : markRaw;

                return { id, last_fist_name, mark };
            }).filter(s => s.last_fist_name);

            await api.post('/mark/import', marksData);

            fetchMarks();
        } catch (err) {
            console.error('Ошибка импорта:', err);
            alert('Ошибка при импорте данных');
        }
    };

    return (
        <div className={styles.examPage}>
            <AdminSidebar active={active} setActive={setActive} basePath="/admin" />
            <div className={styles.content}>
                <HeaderEl
                    header={`Оценки за ${type === 'credits' ? 'зачёт' : 'экзамен'}`}
                    title={`Просмотр оценок за экзамен по дисциплине ${discipline || ''} (${examDate || '—'})`}
                    searchQuery={searchQuery}
                    onSearch={setSearchQuery}
                    setShowModal={setShowModal}
                    type="marks"
                    onExport={handleExport}
                    onImport={handleImport}
                />

                {loading && <p>Загрузка...</p>}
                {error && <p className={styles.error}>{error}</p>}

                {!loading && !error && (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                            <tr>
                                <th>Студент</th>
                                <th>Оценка</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredMarksData.length === 0 ? (
                                <tr>
                                    <td colSpan="2">Студенты не найдены</td>
                                </tr>
                            ) : (
                                filteredMarksData.map(({ student_id, student_full_name, mark }) => (
                                    <tr key={student_id}>
                                        <td>{student_full_name}</td>
                                        <td>{mark !== null && mark !== undefined ? mark : 'н/а'}</td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Exam;
