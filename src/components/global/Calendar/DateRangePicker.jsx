import React, { useState, useEffect, useRef } from 'react';
import styles from './DateRangePicker.module.css';

const DateRangePicker = ({ startDate: initialStart, endDate: initialEnd, onRangeSelect, onClickOutside, onClear }) => {
    const [startDate, setStartDate] = useState(initialStart || null);
    const [endDate, setEndDate] = useState(initialEnd || null);
    const [currentMonth, setCurrentMonth] = useState(initialStart ? new Date(initialStart) : new Date());
    const [isMonthYearPickerOpen, setIsMonthYearPickerOpen] = useState(false);
    const wrapperRef = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                onClickOutside?.();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClickOutside]);

    useEffect(() => {
        setStartDate(initialStart || null);
        setEndDate(initialEnd || null);
        if (initialStart) {
            setCurrentMonth(new Date(initialStart));
        }
    }, [initialStart, initialEnd]);

    const handleDateClick = (date) => {
        if (!startDate && !endDate) {
            setStartDate(date);
        } else if (startDate && !endDate) {
            if (date < startDate) {
                setEndDate(startDate);
                setStartDate(date);
                onRangeSelect?.(date, startDate);
            } else if (date > startDate) {
                setEndDate(date);
                onRangeSelect?.(startDate, date);
            } else {
                setStartDate(null);
                setEndDate(null);
            }
        } else {
            setStartDate(date);
            setEndDate(null);
        }
    };

    const isSameDay = (d1, d2) => d1?.toDateString() === d2?.toDateString();
    const isInRange = (date) => startDate && endDate && date > startDate && date < endDate;
    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const changeMonth = (offset) => {
        const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
        setCurrentMonth(newMonth);
    };

    const clearSelection = () => {
        setStartDate(null);
        setEndDate(null);
        setCurrentMonth(new Date());
        setIsMonthYearPickerOpen(false);
        onClear?.();
    };

    const getCalendarDates = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);
        const startDay = (startOfMonth.getDay() + 6) % 7;

        const days = [];
        for (let i = startDay - 1; i >= 0; i--) {
            days.push(new Date(year, month, -i));
        }
        for (let i = 1; i <= endOfMonth.getDate(); i++) {
            days.push(new Date(year, month, i));
        }
        while (days.length % 7 !== 0) {
            days.push(new Date(year, month + 1, days.length - endOfMonth.getDate() - startDay + 1));
        }

        return days;
    };

    const handleMonthSelect = (monthIndex) => {
        const newMonth = new Date(currentMonth.getFullYear(), monthIndex, 1);
        setCurrentMonth(newMonth);
        setIsMonthYearPickerOpen(false);
    };

    const handleYearChange = (offset) => {
        const newMonth = new Date(currentMonth.getFullYear() + offset, currentMonth.getMonth(), 1);
        setCurrentMonth(newMonth);
    };

    const renderMonthYearPicker = () => {
        const year = currentMonth.getFullYear();
        const currentMonthIndex = currentMonth.getMonth();
        return (
            <div className={styles.monthYearPicker}>
                <div className={styles.yearSelector}>
                    <button onClick={() => handleYearChange(-1)}>‹</button>
                    <span>{year}</span>
                    <button onClick={() => handleYearChange(1)}>›</button>
                </div>
                <div className={styles.monthGrid}>
                    {Array.from({ length: 12 }).map((_, monthIndex) => {
                        const isSelected = monthIndex === currentMonthIndex;
                        const monthName = new Date(year, monthIndex, 1)
                            .toLocaleString('default', { month: 'short' });
                        return (
                            <div
                                key={monthIndex}
                                className={`${styles.monthItem} ${isSelected ? styles.selectedMonth : ''}`}
                                onClick={() => handleMonthSelect(monthIndex)}
                            >
                                {monthName}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            <div className={styles.calendar}>
                <div className={styles.header}>
                    {!isMonthYearPickerOpen && (
                        <>
                            <button className={styles.navBtn} onClick={() => changeMonth(-1)}>‹</button>
                            <button
                                className={styles.monthLabel}
                                onClick={() => setIsMonthYearPickerOpen(true)}
                            >
                                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </button>
                            <button className={styles.navBtn} onClick={() => changeMonth(1)}>›</button>
                        </>
                    )}
                </div>

                {isMonthYearPickerOpen ? (
                    <>
                        {renderMonthYearPicker()}
                        <button className={styles.cancelBtn} onClick={() => setIsMonthYearPickerOpen(false)}>Отмена</button>
                    </>
                ) : (
                    <>
                        <div className={styles.weekdays}>
                            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
                                <div key={d} className={styles.weekday}>{d}</div>
                            ))}
                        </div>
                        <div className={styles.grid}>
                            {getCalendarDates().map((date, idx) => {
                                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                                const isRangeStart = isSameDay(date, startDate);
                                const isRangeEnd = isSameDay(date, endDate);
                                const inRange = isInRange(date);

                                return (
                                    <div
                                        key={idx}
                                        className={`${styles.day} 
                                            ${!isCurrentMonth ? styles.outside : ''} 
                                            ${inRange ? styles.inRange : ''} 
                                            ${isRangeStart ? styles.rangeStart : ''} 
                                            ${isRangeEnd ? styles.rangeEnd : ''} 
                                            ${isToday(date) ? styles.today : ''}
                                        `}
                                        onClick={() => handleDateClick(date)}
                                    >
                                        {date.getDate()}
                                    </div>
                                );
                            })}
                        </div>
                        <button className={styles.clearBtn} onClick={clearSelection}>Очистить</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default DateRangePicker;
