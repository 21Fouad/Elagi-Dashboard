import { useEffect, useState, useCallback } from 'react';
import { Bar, Line, Doughnut} from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { t } from 'i18next';

// Register necessary components with Chart.js
ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

export default function DashboardCharts() {
    const { enqueueSnackbar } = useSnackbar();
    const [chartData, setChartData] = useState(null);
    const [mostSoldMedicines, setMostSoldMedicines] = useState(null);
    const [userRegistrationData, setUserRegistrationData] = useState(null);
    const [salesRevenueData, setSalesRevenueData] = useState(null);

    const fetchChartData = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/dashboard/chart-data');
            setChartData(response.data);
        } catch (error) {
            console.error('Error fetching chart data:', error);
            enqueueSnackbar(t('charts.errorFetchingData'), { variant: 'error' });
        }
    }, [enqueueSnackbar]);

    const fetchUserRegistrationData = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/dashboard/user-registrations');
            setUserRegistrationData(response.data);
        } catch (error) {
            console.error('Error fetching user registration data:', error);
            enqueueSnackbar(t('charts.errorFetchingData'), { variant: 'error' });
        }
    }, [enqueueSnackbar]);

    const fetchMostSoldMedicines = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/dashboard/most-sold-medicines');
            setMostSoldMedicines(response.data);
        } catch (error) {
            console.error('Error fetching most sold medicines data:', error);
            enqueueSnackbar(t('charts.errorFetchingData'), { variant: 'error' });
        }
    }, [enqueueSnackbar]);

    const fetchSalesRevenueData = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/dashboard/sales-revenue');
            setSalesRevenueData(response.data);
        } catch (error) {
            console.error('Error fetching sales revenue data:', error);
            enqueueSnackbar(t('charts.errorFetchingData'), { variant: 'error' });
        }
    }, [enqueueSnackbar]);


    useEffect(() => {
        fetchChartData();
        fetchMostSoldMedicines();
        fetchUserRegistrationData();
        fetchSalesRevenueData();
    }, [fetchChartData, fetchMostSoldMedicines, fetchUserRegistrationData, fetchSalesRevenueData]);

    if (!chartData || !mostSoldMedicines || !userRegistrationData || !salesRevenueData) return <div>{t('charts.loading')}</div>;

    const userData = {
        labels: [t('charts.users'), t('charts.orders'), t('charts.products')],
        datasets: [{
            label: t('charts.counts'),
            data: [chartData.userCount, chartData.orderCount, chartData.productCount],
            backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)']
        }]
    };

    const monthlyOrdersData = {
        labels: chartData.monthlyOrders ? chartData.monthlyOrders.map(o => `${t('charts.month')} ${o.month}`) : [],
        datasets: [{
            label: t('charts.monthlyOrdersLabel'),
            data: chartData.monthlyOrders ? chartData.monthlyOrders.map(o => o.count) : [],
            backgroundColor: 'rgba(153, 102, 255, 0.6)'
        }]
    };

    const userRegistrationsData = {
        labels: userRegistrationData.map(r => r.date),
        datasets: [{
            label: t('charts.userRegistrations'),
            data: userRegistrationData.map(r => r.count),
            fill: false,
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0.1
        }]
    };

    const mostSoldMedicinesData = {
        labels: mostSoldMedicines.map(m => m.medicine_name),
        datasets: [{
            label: t('charts.quantitySold'),
            data: mostSoldMedicines.map(m => m.total),
            backgroundColor: 'rgba(255, 99, 132, 0.6)'
        }]
    };

    const salesRevenueDataConfig = {
        labels: salesRevenueData.map(r => r.date),
        datasets: [{
            label: t('charts.salesRevenue'),
            data: salesRevenueData.map(r => r.total_revenue),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            fill: false,
            tension: 0.1
        }]
    };

    return (
        <div className='my-5'>
            <div className="chart-container  mx-auto col-12 col-md-5">
                <h3 className='text-center'>{t('charts.userOrdersProductsCount')}</h3>
                <Doughnut data={userData} />
            </div>
            <div className='row'>
                <div className='col-12 col-md-6'>
                    <div className="chart-container mt-3">
                        <h3 className='text-center'>{t('charts.monthlyOrders')}</h3>
                        <Bar data={monthlyOrdersData} />
                    </div>
                </div>
                <div className='col-12 col-md-6'>
                    <div className="chart-container mt-3">
                        <h3 className='text-center'>{t('charts.mostSoldMedicines')}</h3>
                        <Bar data={mostSoldMedicinesData} />
                    </div>
                </div>
                <div className='col-12 col-md-6'>
                    <div className="chart-container mt-3">
                        <h3 className='text-center'>{t('charts.userRegistrationsOverTime')}</h3>
                        <Line data={userRegistrationsData} />
                    </div>
                </div>
                <div className='col-12 col-md-6'>
                    <div className="chart-container mt-3">
                        <h3 className='text-center'>{t('charts.salesRevenue')}</h3>
                        <Line data={salesRevenueDataConfig} />
                    </div>
                </div>
            </div>
        </div>
    );
}
