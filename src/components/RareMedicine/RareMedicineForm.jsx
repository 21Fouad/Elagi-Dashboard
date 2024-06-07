import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

export default function RareMedicineRequestTable() {
    const { t, i18n } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const [requests, setRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [visibleRequests, setVisibleRequests] = useState(10);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/rare-medicine-requests');
            const sortedRequests = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setRequests(sortedRequests);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        }
    };

    const handleDelete = async () => {
        setShowConfirmModal(false);
        try {
            await axios.delete(`http://localhost:8000/api/rare-medicine-requests/${selectedRequestId}`);
            fetchRequests();
            enqueueSnackbar(t('rareMedicineRequests.deletedSuccess'), { variant: 'success', anchorOrigin: { vertical: 'top', horizontal: 'center' } });
        } catch (error) {
            console.error('Failed to delete request:', error);
            enqueueSnackbar(t('rareMedicineRequests.deleteFailed'), { variant: 'error', anchorOrigin: { vertical: 'top', horizontal: 'center' } });
        }
    };

    const confirmDelete = (id) => {
        setSelectedRequestId(id);
        setShowConfirmModal(true);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleViewMore = () => {
        setVisibleRequests(prevVisibleRequests => prevVisibleRequests + 10);
    };

    const handleViewLess = () => {
        setVisibleRequests(10);
    };

    const filteredRequests = requests.filter(request =>
        request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className='container mt-5'>
                <h1 className='my-5 text-center'>{t('rareMedicineRequests.title')}</h1>
                <div className={`search-bar-container d-flex my-4 ${i18n.language === 'ar' ? 'me-4' : 'ms-5'}`}>
                    <div className="search-bar">
                        <i className="fa fa-search" aria-hidden="true"></i>
                        <input
                            type="text"
                            placeholder={t('rareMedicineRequests.searchPlaceholder')}
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
                                <th>{t('rareMedicineRequests.name')}</th>
                                <th>{t('rareMedicineRequests.medicineName')}</th>
                                <th>{t('rareMedicineRequests.quantity')}</th>
                                <th>{t('rareMedicineRequests.phone')}</th>
                                <th>{t('rareMedicineRequests.address')}</th>
                                <th>{t('rareMedicineRequests.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.slice(0, visibleRequests).map((request, index) => (
                                <tr key={request.id}>
                                    <td>{index + 1}</td>
                                    <td>{request.name}</td>
                                    <td>{request.medicine_name}</td>
                                    <td>{request.quantity}</td>
                                    <td>{request.phone}</td>
                                    <td>{request.address}</td>
                                    <td>
                                        <button className="btn btn-danger" onClick={() => confirmDelete(request.id)}>{t('rareMedicineRequests.delete')}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="d-flex justify-content-center my-3">
                    {visibleRequests < filteredRequests.length && (
                        <button className="btn btn-primary mx-2" onClick={handleViewMore}>{t('rareMedicineRequests.viewMore')}</button>
                    )}
                    {visibleRequests > 10 && (
                        <button className="btn btn-secondary mx-2" onClick={handleViewLess}>{t('rareMedicineRequests.viewLess')}</button>
                    )}
                </div>

                {showConfirmModal && (
                    <div className="modal show fade" style={{ display: "block" }} tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{t('rareMedicineRequests.confirmDelete')}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>{t('rareMedicineRequests.close')}</button>
                                    <button type="button" className="btn btn-danger" onClick={handleDelete}>{t('rareMedicineRequests.delete')}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
