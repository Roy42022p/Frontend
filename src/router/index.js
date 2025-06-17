import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Staff from '../pages/Login/Staff/Staff';
import XApi from '../pages/Login/XApi/XApi';
import Login from '../pages/Login/Login';
import styles from './index.module.css';
import Admin from "../pages/Admin/Admin";
import Exam from "../pages/Exam/Exam";
import Curator from "../pages/Curator/Curator";
import PrivateRoute from './PrivateRoute';
import Student from "../pages/Student/Student";

function AppRoutes() {
    return (
        <Suspense fallback={<div className={styles.loader}>Загрузка...</div>}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/login/staff" element={<Staff />} />
                <Route path="/login/x-api" element={<XApi />} />

                <Route
                    path="/exam/:id"
                    element={
                        <PrivateRoute
                            element={<Exam />}
                            allowedRoles={['curator', 'admin']}
                        />
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <PrivateRoute
                            element={<Admin />}
                            allowedRoles={['admin']}
                        />
                    }
                />

                <Route
                    path="/curator"
                    element={
                        <PrivateRoute
                            element={<Curator />}
                            allowedRoles={['curator']}
                        />
                    }
                />

                <Route
                    path="/student"
                    element={
                        <PrivateRoute
                            element={<Student />}
                            allowedRoles={['student']}
                        />
                    }
                />
            </Routes>
        </Suspense>
    );
}

export default AppRoutes;