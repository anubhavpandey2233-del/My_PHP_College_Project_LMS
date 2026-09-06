import { useEffect, useState } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loading from '../../components/common/Loading';
import './Subcategories.scss';

const Subcategories = () => {

    const [subcategories, setSubcategories] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');

    const [form, setForm] = useState({
        category_id: '',
        name: '',
        description: '',
        status: 'active'
    });

    const fetchCategories = async () => {

        try {

            const res = await api.get('/categories/list.php');

            if (res.data.status) {

                setCategories(
                    res.data.data || []
                );

            } else {

                setCategories([]);

            }

        } catch (error) {

            console.error(
                'Categories Error:',
                error
            );

            setCategories([]);

        }

    };

    const fetchSubcategories = async () => {

        try {

            setLoading(true);

            const res = await api.get(
                '/subcategories/admin-list.php'
            );

            if (res.data.status) {

                setSubcategories(
                    res.data.data || []
                );

            } else {

                setSubcategories([]);

            }

        } catch (error) {

            console.error(
                'Subcategories Error:',
                error
            );

            setSubcategories([]);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchCategories();
        fetchSubcategories();

    }, []);

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));

    };

    const handleCategoryFilter = (e) => {

        setSelectedCategory(
            e.target.value
        );

        setSelectedSubcategory('');

    };

    const handleSubcategoryFilter = (e) => {

        setSelectedSubcategory(
            e.target.value
        );

    };

    const filteredSubcategories =
        subcategories.filter((item) => {

            const categoryMatch =
                selectedCategory === '' ||
                String(item.category_id) ===
                String(selectedCategory);

            const subcategoryMatch =
                selectedSubcategory === '' ||
                String(item.id) ===
                String(selectedSubcategory);

            return (
                categoryMatch &&
                subcategoryMatch
            );

        });

    const resetForm = () => {

        setForm({
            category_id: '',
            name: '',
            description: '',
            status: 'active'
        });

        setEditingId(null);

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!form.category_id) {

            alert(
                'Please select a category'
            );

            return;

        }

        if (!form.name.trim()) {

            alert(
                'Subcategory name is required'
            );

            return;

        }

        try {

            setSaving(true);

            let res;

            if (editingId) {

                res = await api.post(
                    '/subcategories/update.php',
                    {
                        id: editingId,
                        ...form
                    }
                );

            } else {

                res = await api.post(
                    '/subcategories/create.php',
                    form
                );

            }

            if (res.data.status) {

                alert(
                    editingId
                        ? 'Subcategory updated successfully'
                        : 'Subcategory created successfully'
                );

                resetForm();
                fetchSubcategories();

            } else {

                alert(
                    res.data.message ||
                    'Something went wrong'
                );

            }

        } catch (error) {

            console.error(
                'Save Subcategory Error:',
                error
            );

            alert(
                error.response?.data?.message ||
                'Failed to save subcategory'
            );

        } finally {

            setSaving(false);

        }

    };

    const handleEdit = (subcategory) => {

        setEditingId(
            subcategory.id
        );

        setForm({

            category_id:
                String(
                    subcategory.category_id
                ),

            name:
                subcategory.name || '',

            description:
                subcategory.description || '',

            status:
                subcategory.status || 'active'

        });

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

    };

    const handleDeactivate = async (id) => {

        const confirmDelete =
            window.confirm(
                'Are you sure you want to deactivate this subcategory?'
            );

        if (!confirmDelete) {

            return;

        }

        try {

            const res = await api.post(
                '/subcategories/delete.php',
                {
                    id
                }
            );

            if (res.data.status) {

                alert(
                    'Subcategory deactivated successfully'
                );

                fetchSubcategories();

            } else {

                alert(
                    res.data.message ||
                    'Failed to deactivate subcategory'
                );

            }

        } catch (error) {

            console.error(
                'Deactivate Subcategory Error:',
                error
            );

            alert(
                error.response?.data?.message ||
                'Failed to deactivate subcategory'
            );

        }

    };

    return (

        <DashboardLayout>

            <div className="subcategories-page">

                <div className="subcategories-page-header d-flex justify-content-between align-items-center mb-4">

                    <div>

                        <h2 className="mb-1">
                            Subcategories
                        </h2>

                        <p className="text-muted mb-0">
                            Manage course subcategories
                        </p>

                    </div>

                </div>

                <div className="row g-4 subcategories-content">

                    <div className="col-12 col-lg-4 subcategories-form-column">

                        <div className="card shadow-sm border-0 subcategories-form-card">

                            <div className="card-body p-4 subcategories-card-body">

                                <h5 className="mb-4">

                                    {editingId
                                        ? 'Edit Subcategory'
                                        : 'Add Subcategory'}

                                </h5>

                                <form
                                    onSubmit={handleSubmit}
                                    className="subcategories-form"
                                >

                                    <div className="mb-3 subcategories-field">

                                        <label className="form-label">
                                            Category
                                        </label>

                                        <select
                                            name="category_id"
                                            className="form-select"
                                            value={form.category_id}
                                            onChange={handleChange}
                                        >

                                            <option value="">
                                                Select Category
                                            </option>

                                            {categories.map(
                                                (category) => (

                                                    <option
                                                        key={
                                                            category.id
                                                        }
                                                        value={
                                                            category.id
                                                        }
                                                    >

                                                        {
                                                            category.name
                                                        }

                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>

                                    <div className="mb-3 subcategories-field">

                                        <label className="form-label">
                                            Subcategory Name
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            placeholder="Enter subcategory name"
                                            value={form.name}
                                            onChange={handleChange}
                                        />

                                    </div>

                                    <div className="mb-3 subcategories-field">

                                        <label className="form-label">
                                            Description
                                        </label>

                                        <textarea
                                            name="description"
                                            className="form-control"
                                            rows="4"
                                            placeholder="Enter description"
                                            value={
                                                form.description
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>

                                    <div className="mb-4 subcategories-field">

                                        <label className="form-label">
                                            Status
                                        </label>

                                        <select
                                            name="status"
                                            className="form-select"
                                            value={form.status}
                                            onChange={handleChange}
                                        >

                                            <option value="active">
                                                Active
                                            </option>

                                            <option value="inactive">
                                                Inactive
                                            </option>

                                        </select>

                                    </div>

                                    <div className="d-flex gap-2 subcategories-form-buttons">

                                        <button
                                            type="submit"
                                            className="btn btn-primary flex-grow-1"
                                            disabled={saving}
                                        >

                                            {saving
                                                ? 'Saving...'
                                                : editingId
                                                    ? 'Update Subcategory'
                                                    : 'Add Subcategory'}

                                        </button>

                                        {editingId && (

                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={
                                                    resetForm
                                                }
                                                disabled={
                                                    saving
                                                }
                                            >

                                                Cancel

                                            </button>

                                        )}

                                    </div>

                                </form>

                            </div>

                        </div>

                    </div>

                    <div className="col-12 col-lg-8 subcategories-list-column">

                        <div className="card shadow-sm border-0 subcategories-list-card">

                            <div className="card-body p-4 subcategories-card-body">

                                <div className="d-flex justify-content-between align-items-center mb-4 subcategories-list-header">

                                    <h5 className="mb-0">
                                        Subcategory List
                                    </h5>

                                    <span className="badge bg-primary">
                                        {
                                            filteredSubcategories.length
                                        }
                                    </span>

                                </div>

                                <div className="row g-3 mb-4 subcategories-filters">

                                    <div className="col-12 col-md-6 subcategories-filter-column">

                                        <label className="form-label">
                                            Filter by Category
                                        </label>

                                        <select
                                            className="form-select"
                                            value={
                                                selectedCategory
                                            }
                                            onChange={
                                                handleCategoryFilter
                                            }
                                        >

                                            <option value="">
                                                All Categories
                                            </option>

                                            {categories.map(
                                                (category) => (

                                                    <option
                                                        key={
                                                            category.id
                                                        }
                                                        value={
                                                            category.id
                                                        }
                                                    >

                                                        {
                                                            category.name
                                                        }

                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>

                                    <div className="col-12 col-md-6 subcategories-filter-column">

                                        <label className="form-label">
                                            Filter by Subcategory
                                        </label>

                                        <select
                                            className="form-select"
                                            value={
                                                selectedSubcategory
                                            }
                                            onChange={
                                                handleSubcategoryFilter
                                            }
                                            disabled={
                                                !selectedCategory
                                            }
                                        >

                                            <option value="">

                                                {selectedCategory
                                                    ? 'All Subcategories'
                                                    : 'Select Category First'}

                                            </option>

                                            {subcategories
                                                .filter(
                                                    (item) =>
                                                        String(
                                                            item.category_id
                                                        ) ===
                                                        String(
                                                            selectedCategory
                                                        )
                                                )
                                                .map(
                                                    (
                                                        subcategory
                                                    ) => (

                                                        <option
                                                            key={
                                                                subcategory.id
                                                            }
                                                            value={
                                                                subcategory.id
                                                            }
                                                        >

                                                            {
                                                                subcategory.name
                                                            }

                                                        </option>

                                                    )
                                                )}

                                        </select>

                                    </div>

                                </div>

                                {loading ? (

                                    <div className="subcategories-loading">
                                        <Loading />
                                    </div>

                                ) : filteredSubcategories.length === 0 ? (

                                    <div className="text-center py-5 text-muted subcategories-empty">

                                        <i className="bi bi-folder2-open fs-1 d-block mb-3"></i>

                                        No subcategories found.

                                    </div>

                                ) : (

                                    <div className="table-responsive subcategories-table-wrapper">

                                        <table className="table align-middle subcategories-table">

                                            <thead>

                                                <tr>

                                                    <th>
                                                        #
                                                    </th>

                                                    <th>
                                                        Subcategory
                                                    </th>

                                                    <th>
                                                        Category
                                                    </th>

                                                    <th>
                                                        Status
                                                    </th>

                                                    <th>
                                                        Action
                                                    </th>

                                                </tr>

                                            </thead>

                                            <tbody>

                                                {filteredSubcategories.map(
                                                    (
                                                        subcategory,
                                                        index
                                                    ) => (

                                                        <tr
                                                            key={
                                                                subcategory.id
                                                            }
                                                        >

                                                            <td>
                                                                {
                                                                    index + 1
                                                                }
                                                            </td>

                                                            <td>

                                                                <div className="fw-semibold subcategories-name">

                                                                    {
                                                                        subcategory.name
                                                                    }

                                                                </div>

                                                                <small className="text-muted subcategories-slug">

                                                                    {
                                                                        subcategory.slug
                                                                    }

                                                                </small>

                                                            </td>

                                                            <td className="subcategories-category-name">

                                                                {
                                                                    subcategory.category_name
                                                                }

                                                            </td>

                                                            <td>

                                                                <span
                                                                    className={`badge ${
                                                                        subcategory.status ===
                                                                        'active'
                                                                            ? 'bg-success'
                                                                            : 'bg-secondary'
                                                                    }`}
                                                                >

                                                                    {
                                                                        subcategory.status
                                                                    }

                                                                </span>

                                                            </td>

                                                            <td>

                                                                <div className="d-flex gap-2 subcategories-actions">

                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        onClick={() =>
                                                                            handleEdit(
                                                                                subcategory
                                                                            )
                                                                        }
                                                                    >

                                                                        <i className="bi bi-pencil me-1"></i>

                                                                        Edit

                                                                    </button>

                                                                    {subcategory.status ===
                                                                        'active' && (

                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-outline-danger"
                                                                            onClick={() =>
                                                                                handleDeactivate(
                                                                                    subcategory.id
                                                                                )
                                                                            }
                                                                        >

                                                                            <i className="bi bi-trash me-1"></i>

                                                                            Delete

                                                                        </button>

                                                                    )}

                                                                </div>

                                                            </td>

                                                        </tr>

                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                )}

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </DashboardLayout>

    );
};

export default Subcategories;