import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

function NotificationPanel({ setUnreadCount }) {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedNotificationId, setSelectedNotificationId] = useState(null);
    const [selectedNotification, setSelectedNotification] = useState(null);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/api/notifications');
            const sortedNotifications = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setNotifications(sortedNotifications);

            const unreadCount = sortedNotifications.filter(notification => !notification.is_read).length;
            setUnreadCount(unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [setUnreadCount]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleNotificationClick = async (id) => {
        if (selectedNotificationId === id) {
            setSelectedNotificationId(null);
            setSelectedNotification(null);
            return;
        }
        setSelectedNotificationId(id);
        try {
            const response = await axios.get(`http://localhost:8000/api/notifications/${id}`);
            setSelectedNotification(response.data);
            setNotifications(notifications.map(notification =>
                notification.id === id ? { ...notification, is_read: true } : notification
            ));
            const unreadCount = notifications.filter(notification => !notification.is_read).length - 1;
            setUnreadCount(unreadCount);
        } catch (error) {
            console.error('Error fetching notification details:', error);
        }
    };

    const handleMarkAsUnread = async (id) => {
        try {
            await axios.patch(`http://localhost:8000/api/notifications/${id}/unread`);
            setNotifications(notifications.map(notification =>
                notification.id === id ? { ...notification, is_read: false } : notification
            ));
            const unreadCount = notifications.filter(notification => !notification.is_read).length + 1;
            setUnreadCount(unreadCount);
        } catch (error) {
            console.error('Error marking notification as unread:', error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await axios.patch(`http://localhost:8000/api/notifications/${id}/read`);
            setNotifications(notifications.map(notification =>
                notification.id === id ? { ...notification, is_read: true } : notification
            ));
            const unreadCount = notifications.filter(notification => !notification.is_read).length - 1;
            setUnreadCount(unreadCount);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.patch('http://localhost:8000/api/notifications/mark-all-read');
            setNotifications(notifications.map(notification => ({ ...notification, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleMarkAllAsUnread = async () => {
        try {
            await axios.patch('http://localhost:8000/api/notifications/mark-all-unread');
            setNotifications(notifications.map(notification => ({ ...notification, is_read: false })));
            setUnreadCount(notifications.length);
        } catch (error) {
            console.error('Error marking all notifications as unread:', error);
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/api/notifications/${id}`);
            setNotifications(notifications.filter(notification => notification.id !== id));
            const unreadCount = notifications.filter(notification => !notification.is_read && notification.id !== id).length;
            setUnreadCount(unreadCount);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const unreadNotifications = notifications.filter(notification => !notification.is_read);
    const readNotifications = notifications.filter(notification => notification.is_read);

    return (
        <div className="container mt-5">
            <h2>{t('notifications.title')}</h2>
            <div className="mb-3">
                <button className="btn btn-primary me-2" onClick={handleMarkAllAsRead}>
                    {t('notifications.markAllAsRead')}
                </button>
                <button className="btn btn-secondary" onClick={handleMarkAllAsUnread}>
                    {t('notifications.markAllAsUnread')}
                </button>
            </div>
            {loading ? <p>Loading...</p> : (
                <>
                    <h5>{t('notifications.unreadNotifications')}</h5>
                    <ul className="list-group mb-4">
                        {unreadNotifications.map(notification => (
                            <li
                                key={notification.id}
                                className="list-group-item list-group-item-action"
                                style={{ backgroundColor: notification.is_read ? '#f0f0f0' : '#ffffff' }}
                            >
                                <div className="d-flex justify-content-between align-items-center">
                                    <button
                                        className="btn btn-link"
                                        style={{ padding: 0 }}
                                        onClick={() => handleNotificationClick(notification.id)}
                                    >
                                        {t('notifications.newOrder', { name: notification.order?.user?.name || t('notifications.unknownUser') })}
                                    </button>
                                    <div>
                                        <button
                                            className="btn btn-sm btn-primary me-2"
                                            onClick={() => handleMarkAsRead(notification.id)}
                                        >
                                            {t('notifications.markAsRead')}
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDeleteNotification(notification.id)}
                                        >
                                            {t('notifications.delete')}
                                        </button>
                                    </div>
                                </div>
                                {selectedNotificationId === notification.id && selectedNotification && (
                                    <div className="mt-2">
                                        <h4>{t('notifications.orderDetails')}</h4>
                                        <p><strong>{t('notifications.user')}:</strong> {selectedNotification.order?.user?.name || t('notifications.unknownUser')}</p>
                                        <p><strong>{t('notifications.address')}:</strong> {selectedNotification.order?.address || t('notifications.noAddress')}</p>
                                        <p><strong>{t('notifications.totalPrice')}:</strong> {selectedNotification.order?.total_price || t('notifications.noTotalPrice')}</p>
                                        <p><strong>{t('notifications.paymentMethod')}:</strong> {selectedNotification.order?.payment_method || t('notifications.noPaymentMethod')}</p>
                                        <h5>{t('notifications.products')}:</h5>
                                        {selectedNotification.order?.items?.map(item => (
                                            <div key={item.id}>
                                                <p><strong>{t('notifications.productName')}:</strong> {item.medicine_name}</p>
                                                <p><strong>{t('notifications.quantity')}:</strong> {item.quantity}</p>
                                                <p><strong>{t('notifications.price')}:</strong> {item.price}</p>
                                            </div>
                                        )) || <p>{t('notifications.noProducts')}</p>}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    <h5>{t('notifications.readNotifications')}</h5>
                    <ul className="list-group">
                        {readNotifications.map(notification => (
                            <li
                                key={notification.id}
                                className="list-group-item list-group-item-action"
                                style={{ backgroundColor: '#f0f0f0' }}
                            >
                                <div className="d-flex justify-content-between align-items-center">
                                    <button
                                        className="btn btn-link"
                                        style={{ padding: 0 }}
                                        onClick={() => handleNotificationClick(notification.id)}
                                    >
                                        {t('notifications.newOrder', { name: notification.order?.user?.name || t('notifications.unknownUser') })}
                                    </button>
                                    <div>
                                        <button
                                            className="btn btn-sm btn-secondary me-2"
                                            onClick={() => handleMarkAsUnread(notification.id)}
                                        >
                                            {t('notifications.markAsUnread')}
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDeleteNotification(notification.id)}
                                        >
                                            {t('notifications.delete')}
                                        </button>
                                    </div>
                                </div>
                                {selectedNotificationId === notification.id && selectedNotification && (
                                    <div className="mt-2">
                                        <h4>{t('notifications.orderDetails')}</h4>
                                        <p><strong>{t('notifications.user')}:</strong> {selectedNotification.order?.user?.name || t('notifications.unknownUser')}</p>
                                        <p><strong>{t('notifications.address')}:</strong> {selectedNotification.order?.address || t('notifications.noAddress')}</p>
                                        <p><strong>{t('notifications.totalPrice')}:</strong> {selectedNotification.order?.total_price || t('notifications.noTotalPrice')}</p>
                                        <p><strong>{t('notifications.paymentMethod')}:</strong> {selectedNotification.order?.payment_method || t('notifications.noPaymentMethod')}</p>
                                        <h5>{t('notifications.products')}:</h5>
                                        {selectedNotification.order?.items?.map(item => (
                                            <div key={item.id}>
                                                <p><strong>{t('notifications.productName')}:</strong> {item.medicine_name}</p>
                                                <p><strong>{t('notifications.quantity')}:</strong> {item.quantity}</p>
                                                <p><strong>{t('notifications.price')}:</strong> {item.price}</p>
                                            </div>
                                        )) || <p>{t('notifications.noProducts')}</p>}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

NotificationPanel.propTypes = {
    setUnreadCount: PropTypes.func.isRequired
};

export default NotificationPanel;
