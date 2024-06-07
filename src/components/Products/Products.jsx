import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import './products.css';

export default function ProductTable() {
    const { t, i18n } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [visibleProducts, setVisibleProducts] = useState(10);
    const [selectedProduct, setSelectedProduct] = useState({ id: '', name: '', name_ar: '', description: '', description_ar: '', price: '', stock: '', image_url: '', category: '', category_ar: '' });
    const [showModal, setShowModal] = useState(false);
    const [isModified, setIsModified] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewDetails, setViewDetails] = useState(false);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);

    const fetchProducts = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/products');
            setProducts(response.data);
            setFilteredProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            enqueueSnackbar(t('products.fetchError'), { variant: 'error' });
        }
    }, [enqueueSnackbar, t]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleEditClick = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
        setIsModified(false);
        setIsNew(false);
        setViewDetails(false);
    };

    const handleViewDetails = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
        setViewDetails(true); // Enable view details mode
    };

    const handleNewProduct = () => {
        setSelectedProduct({ id: '', name: '', name_ar: '', description: '', description_ar: '', price: '', stock: '', image_url: '', category: '', category_ar: '' });
        setShowModal(true);
        setIsNew(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedProduct(prev => ({ ...prev, [name]: value }));
        setIsModified(true);
    };

    const handleAddProduct = async () => {
        const formData = new FormData();
        Object.entries(selectedProduct).forEach(([key, value]) => {
            formData.append(key, value);
        });

        try {
            await axios.post('http://localhost:8000/api/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            fetchProducts();
            setShowModal(false);
            enqueueSnackbar(t('products.addSuccess'), { variant: 'success' });
        } catch (error) {
            console.error('Error adding product:', error);
            enqueueSnackbar(t('products.addError'), { variant: 'error' });
        }
    };

    const handleSaveChanges = async () => {
        if (!isModified && !isNew) return;

        const method = isNew ? axios.post : axios.put;
        const url = isNew ? 'http://localhost:8000/api/products' : `http://localhost:8000/api/products/${selectedProduct.id}`;

        try {
            await method(url, selectedProduct);
            fetchProducts();
            setShowModal(false);
            enqueueSnackbar(isNew ? t('products.addSuccess') : t('products.updateSuccess'), { variant: 'success' });
        } catch (error) {
            console.error('Error saving product:', error);
            enqueueSnackbar(t('products.updateError'), { variant: 'error' });
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:8000/api/products/${selectedProduct.id}`);
            fetchProducts();
            setShowConfirmDeleteModal(false);
            enqueueSnackbar(t('products.deleteSuccess'), { variant: 'success' });
        } catch (error) {
            console.error('Error deleting product:', error);
            enqueueSnackbar(t('products.deleteError'), { variant: 'error' });
        }
    };

    const confirmDelete = (product) => {
        setSelectedProduct(product);
        setShowConfirmDeleteModal(true);
    };

    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (!term) {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(p => p.name.toLowerCase().includes(term.toLowerCase()) || p.name_ar.toLowerCase().includes(term.toLowerCase())));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileName = file.name;
            setSelectedProduct(prev => ({ ...prev, image_url: fileName }));
            setIsModified(true);
        }
    };

    const handleViewMore = () => {
        setVisibleProducts(prevVisible => prevVisible + 10);
    };

    const handleViewLess = () => {
        setVisibleProducts(10);
    };

    return (
        <>
            <div className='container'>
                <h1 className='my-5 text-center'>{t('products.title')}</h1>
                <div className='d-flex justify-content-between align-items-baseline w-100 mb-4'>
                    <div className={`search-bar w-75 d-flex my-4 ${i18n.language === 'ar' ? 'me-4' : 'ms-5'}`}>
                        <i className="fa fa-search" aria-hidden="true"></i>
                        <input 
                            type="text" 
                            placeholder={t('products.search_placeholder')} 
                            value={searchTerm}
                            onChange={handleSearchChange} 
                            className="search-input shadow-sm py-2 border-info"
                        />
                    </div>
                    <div>
                        <button onClick={handleNewProduct} className="btn btn-success">{t('products.newProduct')}</button>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className='table table-striped table-bordered table-hover'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>{t('products.name')}</th>
                                <th>{t('products.price')}</th>
                                <th>{t('products.stock')}</th>
                                <th>{t('products.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length > 0 ? filteredProducts.slice(0, visibleProducts).map((product, index) => (
                                <tr key={product.id}>
                                    <td>{index + 1}</td>
                                    <td>{i18n.language === 'ar' ? product.name_ar : product.name}</td>
                                    <td>{product.price}</td>
                                    <td>{product.stock}</td>
                                    <td className='d-flex justify-content-around'>
                                        <button onClick={() => handleEditClick(product)} className="btn btn-primary">{t('products.edit')}</button>
                                        <button onClick={() => handleViewDetails(product)} className="btn btn-info">{t('products.viewDetails')}</button>
                                        <button onClick={() => confirmDelete(product)} className="btn btn-danger">{t('products.delete')}</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center">{t('products.noProductsFound')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="d-flex justify-content-center">
                    {visibleProducts < filteredProducts.length && (
                        <button className="btn btn-primary" onClick={handleViewMore}>{t('products.viewMore')}</button>
                    )}
                    {visibleProducts > 10 && (
                        <button className="btn btn-secondary ms-2" onClick={handleViewLess}>{t('products.viewLess')}</button>
                    )}
                </div>
                {showModal && (
                    <div className="modal show fade" style={{ display: "block" }} tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{isNew ? t('products.addNewProduct') : t('products.editProduct')}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    {viewDetails ? (
                                        <div>
                                            <p><strong>{t('products.name')}:</strong> {selectedProduct.name}</p>
                                            <p><strong>{t('products.nameAr')}:</strong> {selectedProduct.name_ar}</p>
                                            <p><strong>{t('products.description')}:</strong> {selectedProduct.description}</p>
                                            <p><strong>{t('products.descriptionAr')}:</strong> {selectedProduct.description_ar}</p>
                                            <p><strong>{t('products.price')}:</strong> {selectedProduct.price}</p>
                                            <p><strong>{t('products.stock')}:</strong> {selectedProduct.stock}</p>
                                            <p><strong>{t('products.category')}:</strong> {selectedProduct.category}</p>
                                            <p><strong>{t('products.categoryAr')}:</strong> {selectedProduct.category_ar}</p>
                                            <p><strong>{t('products.image')}:</strong> <img src={selectedProduct.image_url} alt={selectedProduct.name} style={{ width: '100px' }} /></p>
                                        </div>
                                    ) : (
                                        <>
                                            <label>{t('products.name')}</label>
                                            <input className="form-control mb-2" type="text" name="name" value={selectedProduct.name} onChange={handleChange} />
                                            
                                            <label>{t('products.nameAr')}</label>
                                            <input className="form-control mb-2" type="text" name="name_ar" value={selectedProduct.name_ar} onChange={handleChange} />
                                            
                                            <label>{t('products.description')}</label>
                                            <textarea className="form-control mb-2" name="description" value={selectedProduct.description} onChange={handleChange} />
                                            
                                            <label>{t('products.descriptionAr')}</label>
                                            <textarea className="form-control mb-2" name="description_ar" value={selectedProduct.description_ar} onChange={handleChange} />
                                            
                                            <label>{t('products.price')}</label>
                                            <input className="form-control mb-2" type="number" name="price" value={selectedProduct.price} onChange={handleChange} />
                                            
                                            <label>{t('products.stock')}</label>
                                            <input className="form-control mb-2" type="number" name="stock" value={selectedProduct.stock} onChange={handleChange} />
                                            
                                            <label>{t('products.category')}</label>
                                            <input className="form-control mb-2" type="text" name="category" value={selectedProduct.category} onChange={handleChange} />
                                            
                                            <label>{t('products.categoryAr')}</label>
                                            <input className="form-control mb-2" type="text" name="category_ar" value={selectedProduct.category_ar} onChange={handleChange} />
                                            
                                            <label>{t('products.image')}</label>
                                            <input className="form-control mb-2" type="file" onChange={handleImageChange} accept="image/*"/>
                                        </>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t('products.close')}</button>
                                    {isNew ? 
                                        <button type="button" className="btn btn-success" onClick={handleAddProduct} disabled={!isModified}>{t('products.add')}</button> :
                                        <button type="button" className="btn btn-primary" onClick={handleSaveChanges} disabled={!isModified}>{t('products.save')}</button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {showConfirmDeleteModal && (
                    <div className="modal show fade" style={{ display: "block" }} tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{t('products.confirmDelete')}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowConfirmDeleteModal(false)}></button>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmDeleteModal(false)}>{t('products.close')}</button>
                                    <button type="button" className="btn btn-danger" onClick={handleDelete}>{t('products.delete')}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
