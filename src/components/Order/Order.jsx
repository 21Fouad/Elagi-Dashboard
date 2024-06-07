import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import './order.css';

export default function OrderTable() {
    const { t, i18n } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState({});
    const [originalOrder, setOriginalOrder] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [isModified, setIsModified] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [visibleOrders, setVisibleOrders] = useState(10);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/dorders');
            const sortedOrders = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setOrders(sortedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleEditClick = (order) => {
        setSelectedOrder(order);
        setOriginalOrder(order);
        setShowModal(true);
        setIsModified(false);
    };

    const handleChange = (e) => {
        const updatedOrder = { ...selectedOrder, [e.target.name]: e.target.value };
        setSelectedOrder(updatedOrder);
        checkIfModified(updatedOrder);
    };

    const checkIfModified = (updatedOrder) => {
        const modified = Object.keys(originalOrder).some(key => updatedOrder[key] !== originalOrder[key]);
        setIsModified(modified);
    };

    const handleSaveChanges = async () => {
        if (!isModified) return;
        try {
            await axios.put(`http://localhost:8000/api/dorders/${selectedOrder.id}`, selectedOrder);
            fetchOrders();
            setShowModal(false);
            enqueueSnackbar(t('orders.updatedSuccess'), { variant: 'success', anchorOrigin: { vertical: 'top', horizontal: 'center' } });
        } catch (error) {
            console.error('Error updating order:', error);
            enqueueSnackbar(t('orders.updateFailed'), { variant: 'error', anchorOrigin: { vertical: 'top', horizontal: 'center' } });
        }
    };

    const handleQuantityChange = async (itemIndex, quantity) => {
        let updatedItems = [...selectedOrder.items];
        let item = { ...updatedItems[itemIndex] };
        item.quantity = quantity;
        item.totalPrice = item.price * quantity;
        updatedItems[itemIndex] = item;

        setSelectedOrder({ ...selectedOrder, items: updatedItems });
        recalculateTotalPrice(updatedItems);

        try {
            await axios.put(`http://localhost:8000/api/order-items/${item.id}`, { quantity: item.quantity });
            fetchOrderDetails(selectedOrder.id);
        } catch (error) {
            console.error('Error updating item:', error.response ? error.response.data : error);
            enqueueSnackbar(t('orders.updateItemFailed'), { variant: 'error', anchorOrigin: { vertical: 'top', horizontal: 'center' } });
        }
    };

    const fetchOrderDetails = async (orderId) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/dorders/${orderId}`);
            setSelectedOrder(response.data);
        } catch (error) {
            console.error('Error fetching order details:', error);
            enqueueSnackbar(t('orders.detailsFetchFailed'), { variant: 'error', anchorOrigin: { vertical: 'top', horizontal: 'center' } });
        }
    };

    const recalculateTotalPrice = () => {
        const total = selectedOrder.items.reduce((acc, item) => acc + item.totalPrice, 0);
        setSelectedOrder({ ...selectedOrder, total_price: total });
    };

    const saveOrderChanges = async () => {
        try {
            await axios.put(`http://localhost:8000/api/dorders/${selectedOrder.id}`, selectedOrder);
            fetchOrders();
            setShowDetailsModal(false);
            enqueueSnackbar(t('orders.updatedSuccess'), { variant: 'success', anchorOrigin: { vertical: 'top', horizontal: 'center' } });
        } catch (error) {
            console.error('Error updating order:', error);
            enqueueSnackbar(t('orders.updateFailed'), { variant: 'error', anchorOrigin: { vertical: 'top', horizontal: 'center' } });
        }
    };

    const handleDelete = async () => {
        setShowConfirmModal(false);
        try {
            await axios.delete(`http://localhost:8000/api/dorders/${selectedOrder.id}`);
            fetchOrders();
            enqueueSnackbar(t('orders.deletedSuccess'), { variant: 'success', anchorOrigin: { vertical: 'top', horizontal: 'center' } });
        } catch (error) {
            console.error('Error deleting order:', error);
            enqueueSnackbar(t('orders.deleteFailed'), { variant: 'error', anchorOrigin: { vertical: 'top', horizontal: 'center' } });
        }
    };

    const confirmDelete = (order) => {
        setSelectedOrder(order);
        setShowConfirmModal(true);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredOrders = orders.filter(order =>
        order.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.total_price.toString().includes(searchTerm) ||
        order.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDetailsClick = async (order) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/dorders/${order.id}`);
            setSelectedOrder(response.data);
            setShowDetailsModal(true);
        } catch (error) {
            console.error('Error fetching order details:', error);
            enqueueSnackbar(t('orders.detailsFetchFailed'), { variant: 'error', anchorOrigin: { vertical: 'top', horizontal: 'center' } });
        }
    };

    const handleDetailsClose = () => {
        setShowDetailsModal(false);
    };

    const handleViewMore = () => {
        setVisibleOrders(prevVisibleOrders => prevVisibleOrders + 10);
    };

    const handleViewLess = () => {
        setVisibleOrders(10);
    };

    return (
        <>
            <div className='container mt-5'>
                <h1 className='my-5 text-center'>{t('orders.title')}</h1>
                <div className={`search-bar-container d-flex my-4 ${i18n.language === 'ar' ? 'me-4' : 'ms-5'}`}>
                    <div className="search-bar">
                        <i className="fa fa-search" aria-hidden="true"></i>
                        <input
                            type="text"
                            placeholder={t('orders.search_placeholder')}
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
                                <th>{t('orders.user')}</th>
                                <th>{t('orders.address')}</th>
                                <th>{t('orders.total_price')}</th>
                                <th>{t('orders.payment_method')}</th>
                                <th>{t('orders.details')}</th>
                                <th>{t('orders.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? filteredOrders.slice(0, visibleOrders).map((order, index) => (
                                <tr key={order.id}>
                                    <td>{index + 1}</td>
                                    <td>{order.user_id}</td>
                                    <td>{order.address}</td>
                                    <td>{order.total_price}</td>
                                    <td>{order.payment_method}</td>
                                    <td className='text-center'>
                                        <button className="btn btn-info" onClick={() => handleDetailsClick(order)}>
                                            {t('orders.orderDetails')}
                                        </button>
                                    </td>
                                    <td className='d-flex justify-content-center'>
                                        <button className="btn btn-primary mx-1" onClick={() => handleEditClick(order)}>{t('orders.edit')}</button>
                                        <button className="btn btn-danger mx-1" onClick={() => confirmDelete(order)}>{t('orders.delete')}</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="text-center">{t('orders.noOrdersFound')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="d-flex justify-content-center my-3">
                    {visibleOrders < filteredOrders.length && (
                        <button className="btn btn-primary mx-2" onClick={handleViewMore}>{t('orders.viewMore')}</button>
                    )}
                    {visibleOrders > 10 && (
                        <button className="btn btn-secondary mx-2" onClick={handleViewLess}>{t('orders.viewLess')}</button>
                    )}
                </div>
                {showModal && (
                    <div className="modal show fade" style={{ display: "block" }} tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{t('orders.editOrder')}</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <input className="form-control mb-2" type="text" name="address" value={selectedOrder.address || ''} onChange={handleChange} placeholder={t('orders.address')} />
                                    <input className="form-control mb-2" type="number" name="total_price" value={selectedOrder.total_price || ''} onChange={handleChange} placeholder={t('orders.total_price')} />
                                    <input className="form-control mb-2" type="text" name="payment_method" value={selectedOrder.payment_method || ''} onChange={handleChange} placeholder={t('orders.payment_method')} />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t('orders.close')}</button>
                                    <button type="button" className="btn btn-primary" onClick={handleSaveChanges} disabled={!isModified}>{t('orders.saveChanges')}</button>
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
                                    <h5 className="modal-title">{t('orders.confirmDelete')}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>{t('orders.close')}</button>
                                    <button type="button" className="btn btn-danger" onClick={handleDelete}>{t('orders.delete')}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {showDetailsModal && (
                <div className="modal show fade" style={{ display: "block" }} tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{t('orders.details')}</h5>
                                <button type="button" className="btn-close" onClick={handleDetailsClose}></button>
                            </div>
                            <div className="modal-body">
                                <h5>{t('orders.items')}:</h5>
                                <ul>
                                    {selectedOrder.items && selectedOrder.items.map((item, index) => (
                                        <li key={index}>
                                            {t('orders.itemName')}: {i18n.language === 'en' ? item.medicine_name : item.medicine_name_ar} -
                                            {t('orders.quantity')}: <input type="number" min='0' value={item.quantity} onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10))} /> -
                                            {t('orders.price')}: {item.price}
                                        </li>
                                    ))}
                                </ul>
                                <div>{t('orders.total_price')}: {selectedOrder.total_price}</div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>{t('orders.close')}</button>
                                <button type="button" className="btn btn-primary" onClick={saveOrderChanges}>{t('orders.saveChanges')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
