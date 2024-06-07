import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

export default function ContactTable() {
    const { t, i18n } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const [contacts, setContacts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [visibleContacts, setVisibleContacts] = useState(10);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/contacts');
            const sortedContacts = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setContacts(sortedContacts);
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
        }
    };

    const handleDelete = async () => {
        setShowConfirmModal(false);
        try {
            await axios.delete(`http://localhost:8000/api/contacts/${selectedContactId}`);
            fetchContacts();
            enqueueSnackbar(t('contact.deletedSuccess'), { variant: 'success', anchorOrigin: { vertical: 'top', horizontal: 'center' } });
        } catch (error) {
            console.error('Failed to delete contact:', error);
            enqueueSnackbar(t('contact.deleteFailed'), { variant: 'error', anchorOrigin: { vertical: 'top', horizontal: 'center' } });
        }
    };

    const confirmDelete = (id) => {
        setSelectedContactId(id);
        setShowConfirmModal(true);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleViewMore = () => {
        setVisibleContacts(prevVisibleContacts => prevVisibleContacts + 10);
    };

    const handleViewLess = () => {
        setVisibleContacts(10);
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className='container mt-5'>
                <h1 className='my-5 text-center'>{t('contact.title')}</h1>
                <div className={`search-bar-container d-flex my-4 ${i18n.language === 'ar' ? 'me-4' : 'ms-5'}`}>
                    <div className="search-bar">
                        <i className="fa fa-search" aria-hidden="true"></i>
                        <input
                            type="text"
                            placeholder={t('contact.searchPlaceholder')}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input shadow-sm py-2 border-info"
                        />
                    </div>
                </div>
                <div className="table-responsive">
                    <table className={`table table-striped table-bordered table-hover`}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>{t('contact.name')}</th>
                                <th>{t('contact.email')}</th>
                                <th>{t('contact.message')}</th>
                                <th>{t('contact.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContacts.slice(0, visibleContacts).map((contact, index) => (
                                <tr key={contact.id}>
                                    <td>{index + 1}</td>
                                    <td>{contact.name}</td>
                                    <td>{contact.email}</td>
                                    <td>{contact.message}</td>
                                    <td>
                                        <button className="btn btn-danger" onClick={() => confirmDelete(contact.id)}>{t('contact.delete')}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="d-flex justify-content-center my-3">
                    {visibleContacts < filteredContacts.length && (
                        <button className="btn btn-primary mx-2" onClick={handleViewMore}>{t('contact.viewMore')}</button>
                    )}
                    {visibleContacts > 10 && (
                        <button className="btn btn-secondary mx-2" onClick={handleViewLess}>{t('contact.viewLess')}</button>
                    )}
                </div>

                {showConfirmModal && (
                    <div className="modal show fade" style={{ display: "block" }} tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{t('contact.confirmDelete')}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>{t('contact.close')}</button>
                                    <button type="button" className="btn btn-danger" onClick={handleDelete}>{t('contact.delete')}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
