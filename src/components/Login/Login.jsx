import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../AuthContext';
import logo from '../images/logonav.png';
import لوجو from '../images/لوجو.png';
import imgg from '../images/7a473db50a795cb375d2e19267beb169.png';
import './login.css';

export default function Login() {
    const { t, i18n } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        const storedEmail = localStorage.getItem('rememberedEmail');
        if (storedEmail) {
            setEmail(storedEmail);
            setRememberMe(true);
        }
    }, []);


    const { message } = location.state || {};

    useEffect(() => {
        if (message) {
            enqueueSnackbar(message, { variant: 'success' });
        }
    }, [message, enqueueSnackbar]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isValidEmail = email.endsWith('@gmail.com');
    const isFormReady = isValidEmail && password.length >= 8 && !isLoading;

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        enqueueSnackbar(t('login.logging_in'), { variant: 'info' });
        try {
            const response = await axios.post('http://localhost:8000/api/dashlogin', {
                email,
                password
            });
            localStorage.setItem('userToken', response.data.token);
            login(response.data.token); // Call login function from AuthContext

            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            navigate('/');
            setIsLoading(false);
        } catch (error) {
            console.error("Login error:", error);
            setIsLoading(false);
            const errorMessage = error.response?.data?.error || t('login.error_message');
            enqueueSnackbar(errorMessage, { variant: 'error' });
            setError(errorMessage);
        }
    };
    useEffect(() => {
        document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    }, [i18n.language]);

    const handleLanguageChange = (language) => {
        i18n.changeLanguage(language);
    };
    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en';
        handleLanguageChange(newLang);
    };

    return (
        <>
            <div>
                <div className='d-flex col-6 justify-content-end align-items-center switch-style'>
                    <div className="switch">
                        <input id="language-toggle" className="check-toggle check-toggle-round-flat" type="checkbox" checked={i18n.language === 'en'} onChange={toggleLanguage} />
                        <label htmlFor="language-toggle"></label>
                        <span className="on">AR</span>
                        <span className="off">EN</span>
                    </div>
                </div>
            </div>
            <section className='login'>
                <div className='container'>
                    <div className='row align-items-center justify-content-center min-vh-100'>
                        <div className='col-12 col-sm-8 col-md-6 col-lg-5 col-xl-4 bg-primary rounded py-5'>
                            <div className='text-center'>
                                <img src={i18n.language === 'ar' ? لوجو : logo} alt="Logo" className="mb-4" />
                                <img src={imgg} className='img-fluid mb-4' alt="Responsive" />
                            </div>
                        </div>
                        <div className='col-12 col-sm-8 col-md-6 col-lg-5 col-xl-4 mx-auto rounded shadow-lg p-4 bg-light'>
                            <h1 className="text-center mb-4">{t('login.header')}</h1>
                            {error && (
                                <div className="alert alert-danger d-flex align-items-center">
                                    <div className="flex-grow-1">
                                        <div className="text-danger">
                                            <i className={`fas fa-exclamation-triangle text-danger ${i18n.language === 'ar' ? 'ms-2' : 'me-2'}`}></i>    
                                            {error}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <form onSubmit={handleLogin}>
                                <div className='mb-3'>
                                    <label htmlFor="email" className='form-label'>{t('login.email')}</label>
                                    <div className='input-group'>
                                        <span className={`input-group-text ${i18n.language === 'ar' ? 'rounded-end' : 'rounded-start'}`}><i className="fas fa-envelope"></i></span>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            className={`form-control ${i18n.language === 'ar' ? 'rounded-start' : 'rounded-end'}`}
                                            placeholder={t('login.enter_email')}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className='mb-3'>
                                    <label htmlFor="password" className='form-label'>{t('login.password')}</label>
                                    <div className='input-group'>
                                        <span className={`input-group-text ${i18n.language === 'ar' ? 'rounded-end' : 'rounded-start'}`}><i className="fas fa-lock"></i></span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            id="password"
                                            className="form-control"
                                            placeholder={t('login.enter_password')}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <span className={`input-group-text ${i18n.language === 'ar' ? 'rounded-start' : 'rounded-end'}`} onClick={togglePasswordVisibility}>
                                            {showPassword ?  <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
                                        </span>
                                    </div>
                                </div>
                                <div className='text-center mb-3'>
                                    <button type="submit" className="btn btn-primary px-5" disabled={!isFormReady}>
                                        {isLoading ? <i className='fas fa-spinner fa-spin text-light'></i> : t('login.submit')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
