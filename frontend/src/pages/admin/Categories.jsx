import { useEffect, useState } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loading from '../../components/common/Loading';
import './Categories.scss';

const Categories = () => {

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        name: '',
        description: '',
        status: 'active'
    });

    const fetchCategories = () => {

        setLoading(true);

        api
            .get('/categories/list.php')
            .then((res) => {

                console.log(
                    'CATEGORIES API:',
                    res.data
                );

                if (res.data.status) {

                    setCategories(
                        res.data.data || []
                    );

                } else {

                    setCategories([]);

                }

            })
            .catch((error) => {

                console.error(
                    'Categories Error:',
                    error
                );

                setCategories([]);

            })
            .finally(() => {

                setLoading(false);

            });

    };

    useEffect(() => {

        fetchCategories();

    }, []);

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((prev) => ({

            ...prev,
            [name]: value

        }));

    };

    const resetForm = () => {

        setForm({
            name: '',
            description: '',
            status: 'active'
        });

        setEditId(null);

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!form.name.trim()) {

            alert(
                'Category name is required'
            );

            return;

        }

        try {

            setSaving(true);

            if (editId) {

                const res = await api.post(
                    '/categories/update.php',
                    {
                        id: editId,
                        name: form.name,
                        description: form.description,
                        status: form.status
                    }
                );

                if (res.data.status) {

                    alert(
                        'Category updated successfully'
                    );

                    resetForm();
                    fetchCategories();

                } else {

                    alert(
                        res.data.message ||
                        'Failed to update category'
                    );

                }

            } else {

                const res = await api.post(
                    '/categories/create.php',
                    form
                );

                if (res.data.status) {

                    alert(
                        'Category created successfully'
                    );

                    resetForm();
                    fetchCategories();

                } else {

                    alert(
                        res.data.message ||
                        'Failed to create category'
                    );

                }

            }

        } catch (error) {

            console.error(
                'Category Save Error:',
                error
            );

            alert(
                error.response?.data?.message ||
                'Failed to save category'
            );

        } finally {

            setSaving(false);

        }

    };

    const handleEdit = (category) => {

        setEditId(category.id);

        setForm({

            name: category.name || '',

            description:
                category.description || '',

            status:
                category.status || 'active'

        });

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

    };

    const handleDeactivate = async (category) => {

        const confirmDelete = window.confirm(
            `Are you sure you want to deactivate "${category.name}"?`
        );

        if (!confirmDelete) {
            return;
        }

        try {

            const res = await api.post(
                '/categories/delete.php',
                {
                    id: category.id
                }
            );

            if (res.data.status) {

                alert(
                    'Category deactivated successfully'
                );

                fetchCategories();

            } else {

                alert(
                    res.data.message ||
                    'Failed to deactivate category'
                );

            }

        } catch (error) {

            console.error(
                'Deactivate Category Error:',
                error
            );

            alert(
                error.response?.data?.message ||
                'Failed to deactivate category'
            );

        }

    };

    const filteredCategories = categories.filter((category) =>
        category.name
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (

        <DashboardLayout>

            <div className="categories-page">

                <div className="categories-page-header d-flex justify-content-between align-items-center mb-4">

                    <div>

                        <h2 className="mb-1">
                            Categories
                        </h2>

                        <p className="text-muted mb-0">
                            Manage course categories
                        </p>

                    </div>

                </div>

                <div className="row g-4 categories-content">

                    <div className="col-lg-4 categories-form-column">

                        <div className="card shadow-sm border-0 categories-form-card">

                            <div className="card-body p-4">

                                <h5 className="mb-4">

                                    {editId
                                        ? 'Edit Category'
                                        : 'Add Category'}

                                </h5>

                                <form onSubmit={handleSubmit}>

                                    <div className="mb-3">

                                        <label className="form-label">
                                            Category Name
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            placeholder="Enter category name"
                                            value={form.name}
                                            onChange={handleChange}
                                        />

                                    </div>

                                    <div className="mb-3">

                                        <label className="form-label">
                                            Description
                                        </label>

                                        <textarea
                                            name="description"
                                            className="form-control"
                                            rows="4"
                                            placeholder="Enter category description"
                                            value={form.description}
                                            onChange={handleChange}
                                        />

                                    </div>

                                    <div className="mb-4">

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

                                    <div className="d-flex gap-2 categories-form-buttons">

                                        <button
                                            type="submit"
                                            className="btn btn-primary flex-grow-1"
                                            disabled={saving}
                                        >

                                            {saving
                                                ? 'Saving...'
                                                : editId
                                                    ? 'Update Category'
                                                    : 'Add Category'}

                                        </button>

                                        {editId && (

                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={resetForm}
                                                disabled={saving}
                                            >
                                                Cancel
                                            </button>

                                        )}

                                    </div>

                                </form>

                            </div>

                        </div>

                    </div>

                    <div className="col-lg-8 categories-list-column">

                        <div className="card shadow-sm border-0 categories-list-card">

                            <div className="card-body p-4">

                                <div className="categories-list-header d-flex justify-content-between align-items-center mb-4">

                                    <h5 className="mb-0">
                                        Category List
                                    </h5>

                                    <span className="badge bg-primary">
                                        {filteredCategories.length}
                                    </span>

                                </div>

                                <div className="categories-search mb-4">

                                    <label className="form-label">
                                        Search Category
                                    </label>

                                    <div className="input-group">

                                        <span className="input-group-text">
                                            <i className="bi bi-search"></i>
                                        </span>

                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search category..."
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                        />

                                    </div>

                                </div>

                                {loading ? (

                                    <Loading />

                                ) : categories.length === 0 ? (

                                    <div className="text-center py-5 text-muted categories-empty">

                                        <i className="bi bi-folder2-open fs-1 d-block mb-3"></i>

                                        No categories found.

                                    </div>

                                ) : filteredCategories.length === 0 ? (

                                    <div className="text-center py-5 text-muted categories-empty">

                                        <i className="bi bi-search fs-1 d-block mb-3"></i>

                                        No category matches your search.

                                    </div>

                                ) : (

                                    <div className="table-responsive categories-table-wrapper">

                                        <table className="table align-middle categories-table">

                                            <thead>

                                                <tr>

                                                    <th>
                                                        #
                                                    </th>

                                                    <th>
                                                        Name
                                                    </th>

                                                    <th>
                                                        Description
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

                                                {filteredCategories.map(
                                                    (category, index) => (

                                                        <tr
                                                            key={category.id}
                                                        >

                                                            <td>
                                                                {index + 1}
                                                            </td>

                                                            <td>

                                                                <div className="fw-semibold categories-name">

                                                                    {category.name}

                                                                </div>

                                                                <small className="text-muted categories-slug">

                                                                    {category.slug}

                                                                </small>

                                                            </td>

                                                            <td>

                                                                <span className="text-muted categories-description">

                                                                    {category.description
                                                                        ? category.description
                                                                        : 'No description'}

                                                                </span>

                                                            </td>

                                                            <td>

                                                                <span
                                                                    className={`badge ${
                                                                        category.status ===
                                                                        'active'
                                                                            ? 'bg-success'
                                                                            : 'bg-secondary'
                                                                    }`}
                                                                >

                                                                    {category.status}

                                                                </span>

                                                            </td>

                                                            <td>

                                                                <div className="d-flex gap-2 categories-actions">

                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        onClick={() =>
                                                                            handleEdit(
                                                                                category
                                                                            )
                                                                        }
                                                                    >

                                                                        <i className="bi bi-pencil me-1"></i>

                                                                        Edit

                                                                    </button>

                                                                    {category.status ===
                                                                        'active' && (

                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-outline-danger"
                                                                            onClick={() =>
                                                                                handleDeactivate(
                                                                                    category
                                                                                )
                                                                            }
                                                                        >

                                                                            <i className="bi bi-x-circle me-1"></i>

                                                                            Deactivate

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

export default Categories;