import React, { useState, useRef, useEffect } from 'react';
import api from '../../../api';
import styles from './AttachTicketsModal.module.css';

const AttachTicketsModal = ({ exam, onClose, onSave }) => {
    const [link, setLink] = useState(exam?.link || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const modalRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        const startCloseAnimation = () => {
            setIsClosing(true);
            timeoutRef.current = setTimeout(() => {
                onClose();
                setIsClosing(false);
            }, 300);
        };

        const onEsc = (e) => {
            if (e.key === 'Escape') {
                startCloseAnimation();
            }
        };

        window.addEventListener('keydown', onEsc);
        modalRef.current?.focus();

        return () => {
            window.removeEventListener('keydown', onEsc);
            clearTimeout(timeoutRef.current);
        };
    }, [onClose]);

    const startCloseAnimation = () => {
        setIsClosing(true);
        timeoutRef.current = setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            await api.patch(`/exam/${exam.id}/link`, { link });
            setSuccess(true);
            if (onSave) {
                onSave(link);
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка при сохранении ссылки');
        } finally {
            setSaving(false);
        }
    };

    if (!exam) return null;

    return (
        <div
            className={`${styles.backdrop} ${isClosing ? styles.closing : ''}`}
            onClick={startCloseAnimation}
            tabIndex={-1}
            ref={modalRef}
        >
            <div
                className={`${styles.modal} ${isClosing ? styles.closing : ''}`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="attach-tickets-title"
            >
                <h2 id="attach-tickets-title" className={styles.modalTitle}>
                    Прикрепить билеты для экзамена
                </h2>
                <p className={styles.modalDescription}>
                    Введите ссылку на билеты для экзамена по дисциплине: <b>{exam.discipline}</b>
                </p>
                <div className={styles.inputGroup}>
                    <input
                        id="ticketsLink"
                        type="url"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://example.com/tickets"
                        disabled={saving}
                        className={styles.inputField}
                    />
                </div>

                {error && <p className={styles.error}>{error}</p>}
                {success && <p className={styles.success}>Ссылка успешно сохранена!</p>}

                <div className={styles.actions}>
                    <button onClick={handleSave} disabled={saving || !link.trim()} className={styles.saveButton}>
                        {saving ? 'Сохраняем...' : 'Сохранить'}
                    </button>
                    <button onClick={startCloseAnimation} disabled={saving} className={styles.cancelButton}>
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttachTicketsModal;