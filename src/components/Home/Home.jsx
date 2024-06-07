import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './home.css';
import DashboardCharts from '../Charts/DashboardCharts';

export default function Home() {
    const { t } = useTranslation();
    const [users, setUsers] = useState(0);
    const [medicines, setMedicines] = useState(0);
    const [orders, setOrders] = useState(0);
    const [totalSalesRevenue, setTotalSalesRevenue] = useState(0);

    useEffect(() => {
        const fetchCounts = () => {
            axios.get('http://localhost:8000/api/dashboard/users').then(response => setUsers(response.data.count));
            axios.get('http://localhost:8000/api/dashboard/medicines').then(response => setMedicines(response.data.count));
            axios.get('http://localhost:8000/api/dashboard/orders').then(response => setOrders(response.data.count));
            axios.get('http://localhost:8000/api/dashboard/total-sales-revenue').then(response => setTotalSalesRevenue(parseFloat(response.data.total_sales_revenue)));        };

        fetchCounts();
        const interval = setInterval(fetchCounts, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <h1 className='text-center my-5'>{t('dashboard.title')}</h1>
            <div className='container mt-5'>
                <div className='row text-center cards mt-md-0'>
                    <div className='col-lg-3 col-md-6 col-sm-12 mb-4'>
                        <div className="card border-0 shadow-sm rounded-5 bg-primary text-white">
                            <div className="card-body">
                                <i className="bi bi-people"></i>
                                <h5>{t('dashboard.numberOfUsers')}</h5>
                                <p className="card-text">{users}</p>
                            </div>
                        </div>
                    </div>
                    <div className='col-lg-3 col-md-6 col-sm-12 mb-4'>
                        <div className="card border-0 shadow-sm rounded-5">
                            <div className="card-body">
                                <i className="fa-solid fa-capsules"></i>
                                <h5>{t('dashboard.numberOfMedicines')}</h5>
                                <p className="card-text">{medicines}</p>
                            </div>
                        </div>
                    </div>
                    <div className='col-lg-3 col-md-6 col-sm-12 mb-4'>
                        <div className="card border-0 shadow-sm rounded-5 bg-primary text-white">
                            <div className="card-body">
                                <i className="bi bi-cart3"></i>
                                <h5>{t('dashboard.numberOfOrders')}</h5>
                                <p className="card-text">{orders}</p>
                            </div>
                        </div>
                    </div>
                    <div className='col-lg-3 col-md-6 col-sm-12 mb-4'>
                        <div className="card border-0 shadow-sm rounded-5">
                            <div className="card-body">
                                <i className="bi bi-cash-coin"></i>
                                <h5>{t('dashboard.totalSalesRevenue')}</h5>
                                <p className="card-text">{totalSalesRevenue.toFixed(2)} {t('dashboard.currency')}</p>                            
                            </div>
                        </div>
                    </div>
                </div>
                <DashboardCharts />
            </div>
        </>
    );
}
