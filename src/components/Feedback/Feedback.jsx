import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

export default function FeedbackTable() {
    const { t, i18n } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const [feedbacks, setFeedbacks] = useState([]);
    const [pinnedFeedbacks, setPinnedFeedbacks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
    const [visibleFeedbacks, setVisibleFeedbacks] = useState(10);

    useEffect(() => {
        fetchFeedbacks();
        fetchPinnedFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/feedbacks');
            const sortedFeedbacks = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setFeedbacks(sortedFeedbacks);
        } catch (error) {
            console.error('Failed to fetch feedbacks:', error);
        }
    };

    const fetchPinnedFeedbacks = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/pinnedFeedbacks');
            setPinnedFeedbacks(response.data);
        } catch (error) {
            console.error('Failed to fetch pinned feedbacks:', error);
        }
    };

    const handleApprove = async (id) => {
        try {
            await axios.post(`http://localhost:8000/api/approveFeedback/${id}`);
            setPinnedFeedbacks(pinnedFeedbacks.filter(fb => fb.id !== id));
            fetchFeedbacks();  // Refresh feedback list to include the newly approved feedback
            enqueueSnackbar(t('feedback.approvedSuccess'), { variant: 'success' });
        } catch (error) {
            console.error('Failed to approve feedback:', error);
            enqueueSnackbar(t('feedback.approveFailed'), { variant: 'error' });
        }
    };

    const handleIgnore = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/api/ignoreFeedback/${id}`);
            setPinnedFeedbacks(pinnedFeedbacks.filter(fb => fb.id !== id));
            enqueueSnackbar(t('feedback.ignoredSuccess'), { variant: 'info' });
        } catch (error) {
            console.error('Failed to ignore feedback:', error);
            enqueueSnackbar(t('feedback.ignoreFailed'), { variant: 'error' });
        }
    };

    const handleDelete = async () => {
        setShowConfirmModal(false);
        try {
            await axios.delete(`http://localhost:8000/api/feedbacks/${selectedFeedbackId}`);
            fetchFeedbacks();
            enqueueSnackbar(t('feedback.deletedSuccess'), { variant: 'success' });
        } catch (error) {
            console.error('Failed to delete feedback:', error);
            enqueueSnackbar(t('feedback.deleteFailed'), { variant: 'error' });
        }
    };

    const confirmDelete = (id) => {
        setSelectedFeedbackId(id);
        setShowConfirmModal(true);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleViewMore = () => {
        setVisibleFeedbacks(prevVisibleFeedbacks => prevVisibleFeedbacks + 10);
    };

    const handleViewLess = () => {
        setVisibleFeedbacks(10);
    };

    const filteredFeedbacks = feedbacks.filter(feedback =>
        feedback.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.feedback.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className='container mt-5'>
                <h1 className='my-5 text-center'>{t('feedback.title')}</h1>
                <div className={`search-bar-container d-flex my-4 ${i18n.language === 'ar' ? 'me-2' : 'ms-3'}`}>
                    <div className="search-bar">
                        <i className="fa fa-search" aria-hidden="true"></i>
                        <input
                            type="text"
                            placeholder={t('feedback.searchPlaceholder')}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input shadow-sm py-2 border-info"
                        />
                    </div>
                </div>
                <h2 className="mt-4">{t('feedback.pinnedTitle')}</h2>
                {pinnedFeedbacks.length === 0 ? (
                    <p>{t('feedback.noPinnedFound')}</p>
                ) : (
                    <div className="table-responsive">
                        <table className={`table table-striped table-bordered table-hover`}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>{t('feedback.name')}</th>
                                    <th>{t('feedback.email')}</th>
                                    <th>{t('feedback.feedback')}</th>
                                    <th>{t('feedback.rating')}</th>
                                    <th>{t('feedback.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pinnedFeedbacks.map((fb, index) => (
                                    <tr key={fb.id}>
                                        <td>{index + 1}</td>
                                        <td>{fb.name}</td>
                                        <td>{fb.email}</td>
                                        <td>{fb.feedback}</td>
                                        <td>{fb.rating}</td>
                                        <td>
                                            <button className="btn btn-success" onClick={() => handleApprove(fb.id)}>{t('feedback.approve')}</button>
                                            <button className="btn btn-warning mx-1" onClick={() => handleIgnore(fb.id)}>{t('feedback.ignore')}</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="table-responsive">
                    <table className={`table table-striped table-bordered table-hover`}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>{t('feedback.name')}</th>
                                <th>{t('feedback.email')}</th>
                                <th>{t('feedback.feedback')}</th>
                                <th>{t('feedback.rating')}</th>
                                <th>{t('feedback.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFeedbacks.slice(0, visibleFeedbacks).map((feedback, index) => (
                                <tr key={feedback.id}>
                                    <td>{index + 1}</td>
                                    <td>{feedback.name}</td>
                                    <td>{feedback.email}</td>
                                    <td>{feedback.feedback}</td>
                                    <td>{feedback.rating}</td>
                                    <td>
                                        <button className="btn btn-danger" onClick={() => confirmDelete(feedback.id)}>{t('feedback.delete')}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="d-flex justify-content-center my-3">
                    {visibleFeedbacks < filteredFeedbacks.length && (
                        <button className="btn btn-primary mx-2" onClick={handleViewMore}>{t('feedback.viewMore')}</button>
                    )}
                    {visibleFeedbacks > 10 && (
                        <button className="btn btn-secondary mx-2" onClick={handleViewLess}>{t('feedback.viewLess')}</button>
                    )}
                </div>
                {showConfirmModal && (
                    <div className="modal show fade" style={{ display: "block" }} tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{t('feedback.confirmDelete')}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>{t('feedback.close')}</button>
                                    <button type="button" className="btn btn-danger" onClick={handleDelete}>{t('feedback.delete')}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
