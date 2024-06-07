import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './i18n';
import i18n from './i18n';
import axios from 'axios';
import './App.css';
import { AuthContext } from './components/AuthContext';
import { SnackbarProvider } from 'notistack';
import Sidebar from './components/Sidebar/Sidebar';
import Home from './components/Home/Home';
import UserTable from './components/Users/User';
import OrderTable from './components/Order/Order';
import ProductTable from './components/Products/Products';
import RareMedicineRequestTable from './components/RareMedicine/RareMedicineForm';
import FeedbackTable from './components/Feedback/Feedback';
import ContactTable from './components/Contact/Contact';
import NotificationPanel from './components/Notification/NotificationPanel';
import Login from './components/Login/Login';
import ScrollToTop from './components/Arrow/ScrollToTop';

axios.interceptors.request.use((config) => {
    config.headers['Accept-Language'] = i18n.language;
    return config;
});

function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const { isAuthenticated, logout } = useContext(AuthContext);

    return (
        <SnackbarProvider anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Router>
                <div className="d-flex">
                    {isAuthenticated && (
                        <Sidebar unreadCount={unreadCount} isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} logout={logout} />
                    )}
                    <div className={`main-content flex-grow-1 p-3 ${isSidebarOpen ? 'col-md-10 col-lg-10 col-12' : 'col-md-12 col-lg-12 col-12'}`}>
                        <Routes>
                            {isAuthenticated ? (
                                <>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/users" element={<UserTable />} />
                                    <Route path="/orders" element={<OrderTable />} />
                                    <Route path="/products" element={<ProductTable />} />
                                    <Route path="/rarerequest" element={<RareMedicineRequestTable />} />
                                    <Route path="/feedback" element={<FeedbackTable />} />
                                    <Route path="/contact" element={<ContactTable />} />
                                    <Route path="/notifications" element={<NotificationPanel setUnreadCount={setUnreadCount} />} />
                                </>
                            ) : (
                                <Route path="/login" element={<Login />} />
                            )}
                        </Routes>
                    </div>
                </div>
                <ScrollToTop />
            </Router>
        </SnackbarProvider>
    );
}

export default App;
