import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import './user.css';

export default function UserTable() {
    const { t, i18n } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState({});
    const [originalUser, setOriginalUser] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [isModified, setIsModified] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [visibleUsers, setVisibleUsers] = useState(10);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setOriginalUser(user);
        setShowModal(true);
        setIsModified(false);
        checkValidation(user);
    };

    const handleChange = (e) => {
        const updatedUser = { ...selectedUser, [e.target.name]: e.target.value };
        setSelectedUser(updatedUser);
        checkIfModified(updatedUser);
        checkValidation(updatedUser);
    };

    const checkIfModified = (updatedUser) => {
        const modified = Object.keys(originalUser).some(key => updatedUser[key] !== originalUser[key]);
        setIsModified(modified);
    };

    const checkValidation = (user) => {
        const isValidPhone = user.phone && user.phone.length === 11;
        const isValidEmail = user.email && user.email.endsWith('@gmail.com');
        setIsValid(isValidPhone && isValidEmail);
    };

    const handleSaveChanges = async () => {
        if (!isModified || !isValid) return;
        try {
            await axios.put(`http://localhost:8000/api/users/${selectedUser.id}`, selectedUser);
            fetchUsers();
            setShowModal(false);
            enqueueSnackbar(t('users.updateSuccess'), { variant: 'success' });
        } catch (error) {
            console.error('Error updating user:', error.response ? error.response.data : error.message);
            enqueueSnackbar(t('users.updateError', { message: error.response ? error.response.data.message : 'Unknown error' }), { variant: 'error' });
        }
    };

    const handleDelete = async () => {
        setShowConfirmModal(false);
        try {
            await axios.delete(`http://localhost:8000/api/users/${selectedUser.id}`);
            fetchUsers();
            enqueueSnackbar(t('users.deleteSuccess'), { variant: 'success' });
        } catch (error) {
            console.error('Error deleting user:', error);
            enqueueSnackbar(t('users.deleteError', { message: error.message }), { variant: 'error' });
        }
    };

    const confirmDelete = () => {
        setShowConfirmModal(true);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewMore = () => {
        setVisibleUsers(prevVisibleUsers => prevVisibleUsers + 10);
    };

    const handleViewLess = () => {
        setVisibleUsers(10);
    };

    return (
        <>
            <div className="container mt-5">
                <h1 className="my-5 text-center">{t('users.title')}</h1>
                <div className={`search-bar-container d-flex my-4 ${i18n.language === 'ar' ? 'me-4' : 'ms-5'}`}>
                    <div className="search-bar w-100">
                        <i className="fa fa-search" aria-hidden="true"></i>
                        <input
                            type="text"
                            placeholder={t('users.search_placeholder')}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input shadow-sm py-2 border-info"
                        />
                    </div>
                </div>
                <div className="table-responsive">
                    <table className={`table table-striped table-bordered table-hover`}>
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>{t('users.name')}</th>
                                <th>{t('users.email')}</th>
                                <th>{t('users.phone')}</th>
                                <th>{t('users.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? filteredUsers.slice(0, visibleUsers).map((user, index) => (
                                    <tr key={user.id}>
                                        <td>{index + 1}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.phone}</td>
                                        <td className="d-flex justify-content-center">
                                            <button className="btn btn-primary mx-1" onClick={() => handleEditClick(user)}>{t('users.edit')}</button>
                                            <button className="btn btn-danger mx-1" onClick={confirmDelete}>{t('users.delete')}</button>
                                        </td>
                                    </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="text-center">{t('users.noUsersFound')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="d-flex justify-content-center my-3">
                    {visibleUsers < filteredUsers.length && (
                        <button className="btn btn-primary mx-2" onClick={handleViewMore}>{t('users.viewMore')}</button>
                    )}
                    {visibleUsers > 10 && (
                        <button className="btn btn-secondary mx-2" onClick={handleViewLess}>{t('users.viewLess')}</button>
                    )}
                </div>
                {showModal && (
                    <div className="modal show fade" style={{ display: "block" }} tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{t('users.editUser')}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <input className="form-control mb-2" type="text" name="name" value={selectedUser.name || ''} onChange={handleChange} placeholder={t('users.name')} />
                                    <input className="form-control mb-2" type="email" name="email" value={selectedUser.email || ''} onChange={handleChange} disabled placeholder={t('users.email')} />
                                    <input className="form-control mb-2" type="text" name="phone" value={selectedUser.phone || ''} onChange={handleChange} placeholder={t('users.phone')} />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t('users.close')}</button>
                                    <button type="button" className="btn btn-primary" onClick={handleSaveChanges} disabled={!isModified || !isValid}>{t('users.saveChanges')}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {showConfirmModal && (
                    <div className="modal show fade" style={{ display: "block" }} tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{t('users.confirmDelete')}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>{t('users.close')}</button>
                                    <button type="button" className="btn btn-danger" onClick={handleDelete}>{t('users.delete')}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
