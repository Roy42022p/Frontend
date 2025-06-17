import React from 'react';

const AuthForm = ({
                      onSubmit,
                      login,
                      password,
                      superKey,
                      setLogin,
                      setPassword,
                      setSuperKey,
                      showSuperKey = true,
                      submitText = 'Войти',
                      isLoading = false,
                      error = '',
                      styles
                  }) => (
    <form onSubmit={onSubmit} className={styles.authForm}>
        <div className={styles.inputGroup}>
            <label htmlFor="login" className={styles.label}>Логин</label>
            <input
                type="text"
                id="login"
                name="login"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Введите логин"
                className={styles.inputField}
                autoComplete="username"
                disabled={isLoading}
            />
        </div>

        <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Пароль</label>
            <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className={styles.inputField}
                autoComplete="current-password"
                disabled={isLoading}
            />
        </div>

        {showSuperKey && (
            <div className={styles.inputGroup}>
                <label htmlFor="superKey" className={styles.label}>Супер-ключ</label>
                <input
                    type="password"
                    id="superKey"
                    name="superKey"
                    value={superKey}
                    onChange={(e) => setSuperKey(e.target.value)}
                    placeholder="Введите супер-ключ"
                    className={styles.inputField}
                    disabled={isLoading}
                />
            </div>
        )}

        {error && (
            <div className={styles.errorMessage} style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
                {error}
            </div>
        )}

        <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Загрузка...' : submitText}
        </button>
    </form>
);

export default AuthForm;
