import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { AuthContext } from '../AuthContext';
import logoNavEn from '../images/logonav.png';
import logoNavAr from '../images/لوجو.png';
import './sidebar.css';
import axios from 'axios';

export default function Sidebar({ unreadCount }) {
    const { t, i18n } = useTranslation();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [collapsed, setCollapsed] = useState(false);
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth < 768);
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    }, [i18n.language]);

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    const handleLanguageChange = (language) => {
        i18n.changeLanguage(language);
    };

    const arrowStyle = {
        transform: `rotate(${collapsed ? (i18n.language === 'ar' ? 0 : 180) : (i18n.language === 'ar' ? 180 : 0)}deg)`,
        transition: 'transform 0.3s ease'
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en';
        handleLanguageChange(newLang);
    };

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8000/api/logout', {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });
            logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div>
            {isMobile ? (
                <>
                    <nav className="navbar navbar-expand-lg text-white bg-primary position-fixed top-0 w-100 mb-5">
                        <div className="container-fluid">
                            <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar">
                                <span><i className="fa-solid fa-bars fa-2x"></i></span>
                            </button>
                            <div className="navbar-brand mx-auto">
                                <img src={i18n.language === 'ar' ? logoNavAr : logoNavEn} alt="Logo" height="40" />
                            </div>
                            <div className="offcanvas w-50 offcanvas-start bg-primary" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
                                <div className="offcanvas-header">
                                    <h5 className="offcanvas-title" id="offcanvasNavbarLabel">{t('sidenav.menu')}</h5>
                                    <button type="button" className={`btn-close ${i18n.language === 'ar' ? 'me-auto' : ''}`} data-bs-dismiss="offcanvas" aria-label="Close"></button>
                                </div>
                                <div className="offcanvas-body">
                                    <ul className="nav nav-pills flex-column side-list mt-3">
                                        <li className="nav-item">
                                            <NavLink to="/" className={({ isActive }) => "nav-link" + (isActive ? " text-primary bg-white" : "")}>
                                                <i className={`bi bi-house-door-fill ${i18n.language === 'ar' ? 'ms-1' : 'me-2'}`}></i>
                                                {!collapsed && <span> {t('sidenav.Dashboard')}</span>}
                                            </NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink to="/users" className={({ isActive }) => "nav-link" + (isActive ? " text-primary bg-white" : "")}>
                                                <i className={`bi bi-people ${i18n.language === 'ar' ? 'ms-1' : 'me-2'}`}></i>
                                                {!collapsed && <span> {t('sidenav.users')}</span>}
                                            </NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink to="/orders" className={({ isActive }) => "nav-link" + (isActive ? " text-primary bg-white" : "")}>
                                                <i className={`bi bi-cart3 ${i18n.language === 'ar' ? 'ms-1' : 'me-2'}`}></i>
                                                {!collapsed && <span> {t('sidenav.orders')}</span>}
                                            </NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink to="/products" className={({ isActive }) => "nav-link" + (isActive ? " text-primary bg-white" : "")}>
                                                <i className={`fa-solid fa-capsules ${i18n.language === 'ar' ? 'ms-1' : 'me-2'}`}></i>
                                                {!collapsed && <span> {t('sidenav.products')}</span>}
                                            </NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink to="/rarerequest" className={({ isActive }) => "nav-link" + (isActive ? " text-primary bg-white" : "")}>
                                                <i className={`fa-brands fa-ravelry ${i18n.language === 'ar' ? 'ms-1' : 'me-2'}`}></i>
                                                {!collapsed && <span> {t('sidenav.rarerequest')}</span>}
                                            </NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink to="/feedback" className={({ isActive }) => "nav-link" + (isActive ? " text-primary bg-white" : "")}>
                                                <i className={`bi bi-bag-heart ${i18n.language === 'ar' ? 'ms-1' : 'me-2'}`}></i>
                                                {!collapsed && <span> {t('sidenav.feedback')}</span>}
                                            </NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink to="/contact" className={({ isActive }) => "nav-link" + (isActive ? " text-primary bg-white" : "")}>
                                                <i className={`fa-regular fa-comment ${i18n.language === 'ar' ? 'ms-1' : 'me-2'}`}></i>
                                                {!collapsed && <span> {t('sidenav.contact')}</span>}
                                            </NavLink>
                                        </li>
                                        <li className="nav-item position-relative">
                                            <NavLink to="/notifications" className={({ isActive }) => "nav-link" + (isActive ? " text-primary bg-white" : "")}>
                                                <i className={`bi bi-bell ${i18n.language === 'ar' ? 'ms-1' : 'me-2'}`}></i>
                                                {!collapsed && <span> {t('sidenav.notification')}</span>}
                                            </NavLink>
                                            {unreadCount > 0 && (
                                                <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-danger">
                                                    {unreadCount}
                                                    <span className="visually-hidden">unread messages</span>
                                                </span>
                                            )}
                                        </li>
                                        <li className="nav-item">
                                            <Link to="#" onClick={handleLogout} className="nav-link">
                                                <i className={`fa-solid fa-arrow-right-from-bracket ${i18n.language === 'ar' ? 'ms-1' : 'me-2'}`}></i>
                                                {!collapsed && <span> {t('sidenav.logout')}</span>}
                                            </Link>
                                        </li>
                                    </ul>
                                    <div className='d-flex col-3'>
                                        <div className="switch">
                                            <input id="language-toggle" className="check-toggle check-toggle-round-flat" type="checkbox" checked={i18n.language === 'en'} onChange={toggleLanguage} />
                                            <label htmlFor="language-toggle"></label>
                                            <span className="on">AR</span>
                                            <span className="off">EN</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </nav>
                </>
            ) : (
                <div className={`sidebar d-flex flex-column flex-shrink-0 text-white position-fixed h-100 ${collapsed ? 'collapsed' : ''}`}>
                    <div className='container'>
                        <div className='row mt-3'>
                            <div className='col-7'>
                                <NavLink className="navbar-brand text-center" to="#">
                                    <img src={i18n.language === 'ar' ? logoNavAr : logoNavEn} alt="Logo" width="121" height="37" className="d-inline-block align-text-top" />
                                </NavLink>
                            </div>
                        </div>
                    </div>
                    <div className={`position-absolute top-0 ${i18n.language === 'ar' ? 'end-100' : 'start-100'}`}>
                        <button className="btn" onClick={toggleSidebar}>
                            <i className="fa-solid fa-chevron-left text-primary" style={arrowStyle}></i>
                        </button>
                    </div>
                    <ul className="nav nav-pills flex-column side-list mt-3">
                        <li className="nav-item">
                            <NavLink to="/" className={({ isActive }) => "nav-link" + (isActive ? " text-primary bg-white" : "")}>
                                <i className={`bi bi-house-door-fill ${i18n.language === 'ar' ? 'ms-1' : 'me-2'}`}></i>
                                {!collapsed && <span> {t('sidenav.Dashboard')}</span>}
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/users" className={({ isActive }) => "nav-link" + (isActive ? " text-primary bg-white" : "")}>
                                <i className={`bi bi-people ${i18n.language === 'ar' ? 'ms-1' : 'me-2'}`}></i>
                                {!collapsed && <span> {t('sidenav.users')}</span>}
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/orders" className={({ isActive }) => "nav-link" + (isActive ? " text-primary bg-white" : "")}>
                                <i className={`bi bi-cart3 ${i18n.language === 'ar' ? 'ms-1' : 'me-2'}`}></i>
                                {!collapsed && <span> {t('sidenav.orders')}</span>}
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/products" className={({ isActive }) => "nav-link" + (isActive ? " text-primary bg-white" : "")}>
                                <i className={`fa-solid fa-capsules ${i18n.language === 'ar' ? 'ms-1' : 'me-2'}`}></i>
                                {!collapsed && <span> {t('sidenav.products')}</span>}
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/rarerequest" className={({ isActive }) => "nav-link" + (isActive ? " text-primary bg-white" : "")}>
                                <i className={`fa-brands fa-ravelry ${i18n.language === 'ar' ? 'ms-1' : 'me-2'}`}></i>
                                {!collapsed && <span> {t('sidenav.rarerequest')}</span>}
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/feedback" className={({ isActive }) => "nav-link" + (isActive ? " text-primary bg-white" : "")}>
                                <i className={`bi bi-bag-heart ${i18n.language === 'ar' ? 'ms-1' : 'me-2'}`}></i>
                                {!collapsed && <span> {t('sidenav.feedback')}</span>}
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/contact" className={({ isActive }) => "nav-link" + (isActive ? " text-primary bg-white" : "")}>
                                <i className={`fa-regular fa-comment ${i18n.language === 'ar' ? 'ms-1' : 'me-2'}`}></i>
                                {!collapsed && <span> {t('sidenav.contact')}</span>}
                            </NavLink>
                        </li>
                        <li className="nav-item position-relative">
                            <NavLink to="/notifications" className={({ isActive }) => "nav-link" + (isActive ? " text-primary bg-white" : "")}>
                                <i className={`bi bi-bell ${i18n.language === 'ar' ? 'ms-1' : 'me-2'}`}></i>
                                {!collapsed && <span> {t('sidenav.notification')}</span>}
                            </NavLink>
                            {unreadCount > 0 && (
                                <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-danger">
                                    {unreadCount}
                                    <span className="visually-hidden">unread messages</span>
                                </span>
                            )}
                        </li>
                        <li className="nav-item">
                            <Link to="#" onClick={handleLogout} className="nav-link">
                                <i className={`fa-solid fa-arrow-right-from-bracket ${i18n.language === 'ar' ? 'ms-1' : 'me-2'}`}></i>
                                {!collapsed && <span> {t('sidenav.logout')}</span>}
                            </Link>
                        </li>
                    </ul>
                    <div className='d-flex col-6 justify-content-end align-items-center switch-style'>
                        <div className="switch">
                            <input id="language-toggle" className="check-toggle check-toggle-round-flat" type="checkbox" checked={i18n.language === 'en'} onChange={toggleLanguage} />
                            <label htmlFor="language-toggle"></label>
                            <span className="on">AR</span>
                            <span className="off">EN</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

Sidebar.propTypes = {
    unreadCount: PropTypes.number.isRequired,
};
