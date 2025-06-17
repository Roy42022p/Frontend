import React, { useRef, useEffect, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import DateRangePicker from "../Calendar/DateRangePicker";
import styles from './HeaderEl.module.css';
import * as XLSX from 'xlsx';

const HeaderEl = ({
                      header,
                      title,
                      searchQuery,
                      onSearch,
                      setShowModal,
                      type,
                      filterStatus = 'all',
                      onFilterChange = () => {},
                      groups = [],
                      onExport = () => {},
                      onDateChange = () => {},
                      onImport = () => {},
                      addButtonText = null
                  }) => {
    const inputRef = useRef();
    const examDropdownRef = useRef();
    const actionDropdownRef = useRef();
    const datePickerRef = useRef();
    const fileInputRef = useRef();

    const [open, setOpen] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedRange, setSelectedRange] = useState({ start: null, end: null });

    const renderAddText = () => {
        if (addButtonText) return addButtonText;

        switch (type) {
            case 'student': return 'Добавить студента';
            case 'curator': return 'Добавить куратора';
            case 'group': return 'Добавить группу';
            case 'exams': return 'Добавить экзамен';
            case 'marks': return '';
            default: return 'Добавить';
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            const examDropdown = examDropdownRef.current;
            const actionDropdown = actionDropdownRef.current;
            const datePicker = datePickerRef.current;

            const isOutsideExam = examDropdown ? !examDropdown.contains(e.target) : true;
            const isOutsideAction = actionDropdown ? !actionDropdown.contains(e.target) : true;
            const isOutsideDate = datePicker ? !datePicker.contains(e.target) : true;

            if (isOutsideExam && isOutsideAction) {
                setOpen(false);
            }

            if (isOutsideDate) {
                setShowDatePicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleGroupSelect = (groupName) => {
        onFilterChange(groupName);
        setOpen(false);
    };

    const handleActionSelect = (action) => {
        if (action === 'import') {
            fileInputRef.current.click();
        } else if (action === 'export') {
            onExport();
        }
        setOpen(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            onImport(jsonData);
        };
        reader.readAsArrayBuffer(file);
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getRangeLabel = () => {
        if (selectedRange.start && selectedRange.end) {
            return `${formatDate(selectedRange.start)} - ${formatDate(selectedRange.end)}`;
        }
        return 'Выберите диапазон дат';
    };

    const handleRangeSelect = (start, end) => {
        setSelectedRange({ start, end });
        onDateChange(start, end);
    };

    const handleClear = () => {
        setSelectedRange({ start: null, end: null });
        onDateChange(null, null);
        setShowDatePicker(false);
    };

    const handleDownloadTemplate = () => {
        const link = document.createElement('a');
        const templates = {
            curator: { href: '/curator_temp.xlsx', name: 'Шаблон_Препод.xlsx' },
            group: { href: '/group_temp.xlsx', name: 'Шаблон_Групп.xlsx' },
            student: { href: '/student_temp.xlsx', name: 'Шаблон_Студ.xlsx' },
            marks: { href: '/mark_temp.xlsx', name: 'Шаблон_Оценки.xlsx' },
        };

        const file = templates[type];
        if (file) {
            link.href = file.href;
            link.download = file.name;
            link.click();
        }
    };


    return (
        <div className={styles.headerEl}>
            <div className={styles.titleSection}>
                <p className={styles.tsHeader}>{header}</p>
                <p className={styles.tsTitle}>{title}</p>
            </div>

            <div className={styles.searchSection}>
                <div className={styles.searchContainer}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Поиск..."
                        className={styles.searchInput}
                    />
                </div>

                {type === 'exams' && (
                    <div className={styles.examFilters}>
                        <div className={styles.filterDropdown} ref={examDropdownRef}>
                            <button
                                className={styles.dropdownButton}
                                onClick={() => setOpen((prev) => !prev)}
                            >
                                {filterStatus === 'all' ? 'Все группы' : filterStatus}
                                <ChevronDown size={16} className={styles.dropdownIcon} />
                            </button>
                            {open && (
                                <ul className={styles.dropdownMenu}>
                                    <li className={styles.dropdownItem} onClick={() => handleGroupSelect('all')}>Все группы</li>
                                    {groups.map((group, index) => (
                                        <li
                                            key={group + index}
                                            className={styles.dropdownItem}
                                            onClick={() => handleGroupSelect(group)}
                                        >
                                            {group}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div style={{ position: 'relative' }} ref={datePickerRef}>
                            <button className={styles.calBtn} onClick={() => setShowDatePicker((prev) => !prev)}>
                                {getRangeLabel()}
                            </button>

                            {showDatePicker && (
                                <div style={{ position: 'absolute', top: '100%', zIndex: 1000, marginTop: '0.5rem' }}>
                                    <DateRangePicker
                                        startDate={selectedRange.start}
                                        endDate={selectedRange.end}
                                        onRangeSelect={handleRangeSelect}
                                        onClear={handleClear}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.buttonSection} ref={actionDropdownRef}>
                {(type === 'student' || type === 'marks' || type === 'group' || type === 'curator') && (
                    <>
                        <button
                            className={styles.dropdownButton}
                            onClick={() => setOpen(o => !o)}
                        >
                            Действие
                            <ChevronDown size={16} className={styles.dropdownIcon} />
                        </button>
                        {open && (
                            <ul className={styles.dropdownMenu}>
                                <li
                                    className={styles.dropdownItem}
                                    onClick={() => handleActionSelect('import')}
                                >
                                    Импорт
                                </li>
                                <li
                                    className={styles.dropdownItem}
                                    onClick={() => handleActionSelect('export')}
                                >
                                    Экспорт
                                </li>
                                <li
                                    className={styles.dropdownItem}
                                    onClick={() => handleDownloadTemplate()}
                                >
                                    Скачать шаблон
                                </li>
                            </ul>
                        )}
                    </>
                )}

                {type !== 'marks' && (
                    <button
                        className={styles.addButton}
                        onClick={() => setShowModal(true)}
                    >
                        {renderAddText()}
                    </button>
                )}
            </div>

            <input
                type="file"
                accept=".xlsx, .xls"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default HeaderEl;
