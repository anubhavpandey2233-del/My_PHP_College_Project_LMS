
import { useEffect, useState } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loading from '../../components/common/Loading';


const IMAGE_URL = 'http://localhost/php-lms-project/backend/uploads/courses/';

const AdminCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [teacher, setTeacher] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('');

    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewLoading, setViewLoading] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);

    const [editCourse, setEditCourse] = useState(null);

    const [editTitle, setEditTitle] = useState('');
    const [editShortDescription, setEditShortDescription] = useState('');
    const [editDescription, setEditDescription] = useState('');

    const [editTeacher, setEditTeacher] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editSubcategory, setEditSubcategory] = useState('');

    const [editPrice, setEditPrice] = useState('');
    const [editDiscountPrice, setEditDiscountPrice] = useState('');

    const [editLevel, setEditLevel] = useState('beginner');
    const [editLanguage, setEditLanguage] = useState('English');
    const [editDuration, setEditDuration] = useState('');

    const [editStatus, setEditStatus] = useState('draft');
    const [editFeatured, setEditFeatured] = useState(0);

    // ===============================
    // Fetch Courses
    // ===============================
    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError('');

            const res = await api.get('/admin/courses.php');

            if (res.data.status) {
                setCourses(res.data.data || []);
            } else {
                setCourses([]);
                setError(
                    res.data.message || 'Unable to load courses'
                );
            }

        } catch (err) {
            console.error('Courses error:', err);

            setCourses([]);

            setError(
                err.response?.data?.message ||
                'Something went wrong while loading courses'
            );
        } finally {
            setLoading(false);
        }
    };

    // ===============================
    // Get Unique Teachers
    // ===============================
    const teachers = [
        ...new Map(
            courses
                .filter((course) => course.teacher_id)
                .map((course) => [
                    course.teacher_id,
                    course.teacher_name
                ])
        ).entries()
    ];

    // ===============================
    // Get Unique Categories
    // ===============================
    const categories = [
        ...new Map(
            courses
                .filter((course) => course.category_id)
                .map((course) => [
                    course.category_id,
                    course.category_name
                ])
        ).entries()
    ];

    // ===============================
    // Filter Courses
    // ===============================
    const filteredCourses = courses.filter((course) => {

        const searchText = search
            .toLowerCase()
            .trim();

        const matchesSearch =
            !searchText ||
            course.title
                ?.toLowerCase()
                .includes(searchText) ||
            course.teacher_name
                ?.toLowerCase()
                .includes(searchText);

        const matchesTeacher =
            !teacher ||
            String(course.teacher_id) === String(teacher);

        const matchesCategory =
            !category ||
            String(course.category_id) === String(category);

        const matchesStatus =
            !status ||
            course.status === status;

        return (
            matchesSearch &&
            matchesTeacher &&
            matchesCategory &&
            matchesStatus
        );
    });

    // ===============================
    // Clear Filters
    // ===============================
    const clearFilters = () => {
        setSearch('');
        setTeacher('');
        setCategory('');
        setStatus('');
    };


    const handleViewCourse = async (course) => {
        try {
            setViewLoading(true);

            const res = await api.get(
                `/admin/course-details.php?id=${course.id}`
            );

            if (res.data.status) {
                setSelectedCourse(res.data.data);
                setShowViewModal(true);
            } else {
                alert(
                    res.data.message || 'Unable to load course details'
                );
            }

        } catch (err) {
            console.error('View course error:', err);

            alert(
                err.response?.data?.message ||
                'Something went wrong while loading course details'
            );
        } finally {
            setViewLoading(false);
        }
    };


    // # Save Course Changes


    const handleSaveEdit = async () => {
        try {
            if (!editCourse?.id) {
                alert('Course ID is missing');
                return;
            }

            const res = await api.post(
                '/admin/edit-course.php',
                {
                    course_id: editCourse.id,

                    title: editTitle,

                    short_description:
                        editShortDescription,

                    description:
                        editDescription,

                    teacher_id:
                        editTeacher,

                    category_id:
                        editCategory,

                    subcategory_id:
                        editSubcategory || null,

                    price:
                        editPrice,

                    discount_price:
                        editDiscountPrice === ''
                            ? null
                            : editDiscountPrice,

                    level:
                        editLevel,

                    language:
                        editLanguage,

                    duration_hours:
                        editDuration,

                    status:
                        editStatus,

                    is_featured:
                        editFeatured
                }
            );

            if (res.data.status) {

                alert(
                    res.data.message ||
                    'Course updated successfully'
                );

                // Close edit modal
                setShowEditModal(false);
                setEditCourse(null);

                // Refresh courses
                await fetchCourses();

            } else {

                alert(
                    res.data.message ||
                    'Unable to update course'
                );
            }

        } catch (err) {

            console.error(
                'Edit course error:',
                err
            );

            alert(
                err.response?.data?.message ||
                'Something went wrong while updating course'
            );
        }
    };


    // # Delete Course Function

    const handleDeleteCourse = async (course) => {
        try {

            const confirmed = window.confirm(
                `Are you sure you want to delete "${course.title}"?`
            );

            if (!confirmed) {
                return;
            }

            const res = await api.post(
                '/admin/delete-course.php',
                {
                    course_id: course.id
                }
            );

            if (res.data.status) {

                alert(
                    res.data.message ||
                    'Course deleted successfully'
                );

                await fetchCourses();

            } else {

                alert(
                    res.data.message ||
                    'Unable to delete course'
                );
            }

        } catch (err) {

            console.error(
                'Delete course error:',
                err
            );

            alert(
                err.response?.data?.message ||
                'Something went wrong while deleting course'
            );
        }
    };




    const openEditModal = async (course) => {
        try {
            setViewLoading(true);

            const res = await api.get(
                `/admin/course-details.php?id=${course.id}`
            );

            if (res.data.status) {
                const data = res.data.data;

                setEditCourse(data);

                setEditTitle(data.title || '');
                setEditShortDescription(data.short_description || '');
                setEditDescription(data.description || '');

                setEditTeacher(
                    data.teacher_id ? String(data.teacher_id) : ''
                );

                setEditCategory(
                    data.category_id ? String(data.category_id) : ''
                );

                setEditSubcategory(
                    data.subcategory_id
                        ? String(data.subcategory_id)
                        : ''
                );

                setEditPrice(
                    data.price !== null &&
                        data.price !== undefined
                        ? String(data.price)
                        : ''
                );

                setEditDiscountPrice(
                    data.discount_price !== null &&
                        data.discount_price !== undefined
                        ? String(data.discount_price)
                        : ''
                );

                setEditLevel(data.level || 'beginner');

                setEditLanguage(
                    data.language || 'English'
                );

                setEditDuration(
                    data.duration_hours !== null &&
                        data.duration_hours !== undefined
                        ? String(data.duration_hours)
                        : ''
                );

                setEditStatus(
                    data.status || 'draft'
                );

                setEditFeatured(
                    Number(data.is_featured || 0)
                );

                setShowEditModal(true);

            } else {
                alert(
                    res.data.message ||
                    'Unable to load course details'
                );
            }

        } catch (err) {

            console.error(
                'Edit course error:',
                err
            );

            alert(
                err.response?.data?.message ||
                'Something went wrong while loading course details'
            );

        } finally {
            setViewLoading(false);
        }
    };




    // ===============================
    // Status Badge
    // ===============================
    const getStatusBadge = (courseStatus) => {

        if (courseStatus === 'published') {
            return (
                <span className="badge bg-success">
                    Published
                </span>
            );
        }

        if (courseStatus === 'archived') {
            return (
                <span className="badge bg-secondary">
                    Archived
                </span>
            );
        }

        return (
            <span className="badge bg-warning text-dark">
                Draft
            </span>
        );
    };

    // ===============================
    // Loading
    // ===============================
    if (loading) {
        return (
            <DashboardLayout>
                <Loading />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>

            {/* ===============================
          Header
      =============================== */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2 className="mb-1">
                        Manage Courses
                    </h2>

                    <p className="text-muted mb-0">
                        View and manage all courses in the LMS
                    </p>
                </div>

                <span className="badge bg-primary fs-6">
                    Total: {filteredCourses.length}
                </span>

            </div>


            {/* ===============================
          Error
      =============================== */}

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}


            {/* ===============================
          Filters
      =============================== */}

            <div className="card shadow-sm border-0 mb-4">

                <div className="card-body">

                    <div className="row g-3">

                        {/* Search */}

                        <div className="col-md-4">

                            <label className="form-label">
                                Search
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search course or teacher..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                        </div>


                        {/* Teacher */}

                        <div className="col-md-2">

                            <label className="form-label">
                                Teacher
                            </label>

                            <select
                                className="form-select"
                                value={teacher}
                                onChange={(e) =>
                                    setTeacher(e.target.value)
                                }
                            >

                                <option value="">
                                    All Teachers
                                </option>

                                {teachers.map(
                                    ([id, name]) => (
                                        <option
                                            key={id}
                                            value={id}
                                        >
                                            {name}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>


                        {/* Category */}

                        <div className="col-md-2">

                            <label className="form-label">
                                Category
                            </label>

                            <select
                                className="form-select"
                                value={category}
                                onChange={(e) =>
                                    setCategory(e.target.value)
                                }
                            >

                                <option value="">
                                    All Categories
                                </option>

                                {categories.map(
                                    ([id, name]) => (
                                        <option
                                            key={id}
                                            value={id}
                                        >
                                            {name}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>


                        {/* Status */}

                        <div className="col-md-2">

                            <label className="form-label">
                                Status
                            </label>

                            <select
                                className="form-select"
                                value={status}
                                onChange={(e) =>
                                    setStatus(e.target.value)
                                }
                            >

                                <option value="">
                                    All Status
                                </option>

                                <option value="draft">
                                    Draft
                                </option>

                                <option value="published">
                                    Published
                                </option>

                                <option value="archived">
                                    Archived
                                </option>

                            </select>

                        </div>


                        {/* Clear */}

                        <div className="col-md-2 d-flex align-items-end">

                            <button
                                type="button"
                                className="btn btn-outline-secondary w-100"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </button>

                        </div>

                    </div>

                </div>

            </div>


            {/* ===============================
          Courses Table
      =============================== */}

            <div className="card shadow-sm border-0">

                <div className="card-body">

                    {filteredCourses.length === 0 ? (

                        <div className="alert alert-info mb-0">
                            No courses found.
                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">

                                <thead className="table-light">

                                    <tr>

                                        <th>#</th>

                                        <th>Course</th>

                                        <th>Teacher</th>

                                        <th>Category</th>

                                        <th>Price</th>

                                        <th>Students</th>

                                        <th>Rating</th>

                                        <th>Status</th>

                                        <th>Actions</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredCourses.map(
                                        (course, index) => (

                                            <tr key={course.id}>

                                                <td>
                                                    {index + 1}
                                                </td>


                                                {/* Course */}

                                                <td>

                                                    <div className="d-flex align-items-center gap-2">

                                                        {course.thumbnail ? (

                                                            <img
                                                                src={`${IMAGE_URL}${course.thumbnail}`}
                                                                alt={course.title}
                                                                style={{
                                                                    width: '55px',
                                                                    height: '40px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '5px'
                                                                }}
                                                            />

                                                        ) : (

                                                            <div
                                                                className="bg-light d-flex align-items-center justify-content-center"
                                                                style={{
                                                                    width: '55px',
                                                                    height: '40px',
                                                                    borderRadius: '5px'
                                                                }}
                                                            >
                                                                📚
                                                            </div>

                                                        )}

                                                        <strong>
                                                            {course.title}
                                                        </strong>

                                                    </div>

                                                </td>


                                                {/* Teacher */}

                                                <td>
                                                    {course.teacher_name || '-'}
                                                </td>


                                                {/* Category */}

                                                <td>
                                                    {course.category_name || '-'}
                                                </td>


                                                {/* Price */}

                                                <td>
                                                    {Number(course.discount_price) > 0 ? (
                                                        <>
                                                            <del className="text-muted">
                                                                ₹{Number(course.price).toFixed(2)}
                                                            </del>

                                                            <br />

                                                            <strong>
                                                                ₹{(
                                                                    Number(course.price) -
                                                                    Number(course.discount_price)
                                                                ).toFixed(2)}
                                                            </strong>
                                                        </>
                                                    ) : (
                                                        <>
                                                            ₹{Number(course.price || 0).toFixed(2)}
                                                        </>
                                                    )}
                                                </td>


                                                {/* Students */}

                                                <td>
                                                    {course.total_students ?? 0}
                                                </td>


                                                {/* Rating */}

                                                <td>
                                                    ⭐ {course.average_rating ?? '0.00'}
                                                </td>


                                                {/* Status */}

                                                <td>
                                                    {getStatusBadge(
                                                        course.status
                                                    )}
                                                </td>


                                                {/* Actions */}

                                                <td>

                                                    <div className="d-flex gap-1 flex-wrap">

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => handleViewCourse(course)}
                                                            disabled={viewLoading}
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => openEditModal(course)}
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDeleteCourse(course)}
                                                        >
                                                            Delete
                                                        </button>

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
            {showViewModal && selectedCourse && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.5)'
                    }}
                >
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">

                        <div className="modal-content">

                            {/* Header */}

                            <div className="modal-header">

                                <h5 className="modal-title">
                                    Course Details
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowViewModal(false);
                                        setSelectedCourse(null);
                                    }}
                                ></button>

                            </div>


                            {/* Body */}

                            <div className="modal-body">

                                {/* Thumbnail */}

                                {selectedCourse.thumbnail && (
                                    <div className="text-center mb-4">

                                        <img
                                            src={`${IMAGE_URL}${selectedCourse.thumbnail}`}
                                            alt={selectedCourse.title}
                                            style={{
                                                width: '220px',
                                                height: '130px',
                                                objectFit: 'cover',
                                                borderRadius: '8px'
                                            }}
                                        />

                                    </div>
                                )}


                                <h4 className="mb-3">
                                    {selectedCourse.title}
                                </h4>


                                {/* Basic Information */}

                                <div className="row g-3">

                                    <div className="col-md-6">

                                        <strong>Teacher</strong>

                                        <p className="mb-0">
                                            {selectedCourse.teacher_name || '-'}
                                        </p>

                                    </div>


                                    <div className="col-md-6">

                                        <strong>Category</strong>

                                        <p className="mb-0">
                                            {selectedCourse.category_name || '-'}
                                        </p>

                                    </div>


                                    <div className="col-md-6">

                                        <strong>Subcategory</strong>

                                        <p className="mb-0">
                                            {selectedCourse.subcategory_name || '-'}
                                        </p>

                                    </div>


                                    <div className="col-md-6">

                                        <strong>Status</strong>

                                        <p className="mb-0">
                                            {selectedCourse.status || '-'}
                                        </p>

                                    </div>


                                    <div className="col-md-6">

                                        <strong>Level</strong>

                                        <p className="mb-0">
                                            {selectedCourse.level || '-'}
                                        </p>

                                    </div>


                                    <div className="col-md-6">

                                        <strong>Language</strong>

                                        <p className="mb-0">
                                            {selectedCourse.language || '-'}
                                        </p>

                                    </div>


                                    <div className="col-md-6">

                                        <strong>Original Price</strong>

                                        <p className="mb-0">
                                            ₹{Number(
                                                selectedCourse.price || 0
                                            ).toFixed(2)}
                                        </p>

                                    </div>


                                    <div className="col-md-6">

                                        <strong>Discount</strong>

                                        <p className="mb-0">
                                            ₹{Number(
                                                selectedCourse.discount_price || 0
                                            ).toFixed(2)}
                                        </p>

                                    </div>


                                    <div className="col-md-6">

                                        <strong>Final Price</strong>

                                        <p className="mb-0 fw-bold">
                                            ₹{(
                                                Number(selectedCourse.price || 0) -
                                                Number(
                                                    selectedCourse.discount_price || 0
                                                )
                                            ).toFixed(2)}
                                        </p>

                                    </div>


                                    <div className="col-md-6">

                                        <strong>Duration</strong>

                                        <p className="mb-0">
                                            {selectedCourse.duration_hours || 0} hours
                                        </p>

                                    </div>
                                    <div className="col-md-6">
                                        <strong>Total Chapters</strong>

                                        <p className="mb-0">
                                            {selectedCourse.total_chapters ?? 0}
                                        </p>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>Total Lessons</strong>

                                        <p className="mb-0">
                                            {selectedCourse.total_lessons ?? 0}
                                        </p>
                                    </div>

                                    <div className="col-md-6">

                                        <strong>Total Lessons</strong>

                                        <p className="mb-0">
                                            {selectedCourse.total_lessons || 0}
                                        </p>

                                    </div>


                                    <div className="col-md-6">

                                        <strong>Total Students</strong>

                                        <p className="mb-0">
                                            {selectedCourse.total_students || 0}
                                        </p>

                                    </div>


                                    <div className="col-md-6">

                                        <strong>Average Rating</strong>

                                        <p className="mb-0">
                                            ⭐ {selectedCourse.average_rating || '0.00'}
                                        </p>

                                    </div>

                                </div>


                                {/* Short Description */}

                                <hr />

                                <h6>
                                    Short Description
                                </h6>

                                <p className="text-muted">
                                    {selectedCourse.short_description || 'No short description available.'}
                                </p>


                                {/* Description */}

                                <h6>
                                    Description
                                </h6>

                                <p className="text-muted">
                                    {selectedCourse.description || 'No description available.'}
                                </p>

                            </div>


                            {/* Footer */}

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowViewModal(false);
                                        setSelectedCourse(null);
                                    }}
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>
                </div>
            )}


            {showEditModal && editCourse && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.5)'
                    }}
                >
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">

                        <div className="modal-content">

                            {/* Header */}

                            <div className="modal-header">

                                <h5 className="modal-title">
                                    Edit Course
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditCourse(null);
                                    }}
                                ></button>

                            </div>


                            {/* Body */}

                            <div className="modal-body">

                                <div className="row g-3">

                                    {/* Title */}

                                    <div className="col-md-12">

                                        <label className="form-label">
                                            Course Title
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editTitle}
                                            onChange={(e) =>
                                                setEditTitle(e.target.value)
                                            }
                                        />

                                    </div>


                                    {/* Short Description */}

                                    <div className="col-md-12">

                                        <label className="form-label">
                                            Short Description
                                        </label>

                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={editShortDescription}
                                            onChange={(e) =>
                                                setEditShortDescription(
                                                    e.target.value
                                                )
                                            }
                                        ></textarea>

                                    </div>


                                    {/* Description */}

                                    <div className="col-md-12">

                                        <label className="form-label">
                                            Description
                                        </label>

                                        <textarea
                                            className="form-control"
                                            rows="5"
                                            value={editDescription}
                                            onChange={(e) =>
                                                setEditDescription(
                                                    e.target.value
                                                )
                                            }
                                        ></textarea>

                                    </div>


                                    {/* Teacher */}

                                    <div className="col-md-6">

                                        <label className="form-label">
                                            Teacher
                                        </label>

                                        <select
                                            className="form-select"
                                            value={editTeacher}
                                            onChange={(e) =>
                                                setEditTeacher(e.target.value)
                                            }
                                        >

                                            <option value="">
                                                Select Teacher
                                            </option>

                                            {teachers.map(
                                                ([id, name]) => (
                                                    <option
                                                        key={id}
                                                        value={id}
                                                    >
                                                        {name}
                                                    </option>
                                                )
                                            )}

                                        </select>

                                    </div>


                                    {/* Category */}

                                    <div className="col-md-6">

                                        <label className="form-label">
                                            Category
                                        </label>

                                        <select
                                            className="form-select"
                                            value={editCategory}
                                            onChange={(e) => {
                                                setEditCategory(e.target.value);
                                                setEditSubcategory('');
                                            }}
                                        >

                                            <option value="">
                                                Select Category
                                            </option>

                                            {categories.map(
                                                ([id, name]) => (
                                                    <option
                                                        key={id}
                                                        value={id}
                                                    >
                                                        {name}
                                                    </option>
                                                )
                                            )}

                                        </select>

                                    </div>


                                    {/* Subcategory */}

                                    <div className="col-md-6">

                                        <label className="form-label">
                                            Subcategory
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editSubcategory}
                                            onChange={(e) =>
                                                setEditSubcategory(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Subcategory ID"
                                        />

                                    </div>


                                    {/* Price */}

                                    <div className="col-md-6">

                                        <label className="form-label">
                                            Price
                                        </label>

                                        <input
                                            type="number"
                                            className="form-control"
                                            value={editPrice}
                                            onChange={(e) =>
                                                setEditPrice(e.target.value)
                                            }
                                        />

                                    </div>


                                    {/* Discount */}

                                    <div className="col-md-6">

                                        <label className="form-label">
                                            Discount
                                        </label>

                                        <input
                                            type="number"
                                            className="form-control"
                                            value={editDiscountPrice}
                                            onChange={(e) =>
                                                setEditDiscountPrice(
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>


                                    {/* Final Price */}

                                    <div className="col-md-6">

                                        <label className="form-label">
                                            Final Price
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            value={(
                                                Number(editPrice || 0) -
                                                Number(editDiscountPrice || 0)
                                            ).toFixed(2)}
                                            readOnly
                                        />

                                    </div>


                                    {/* Level */}

                                    <div className="col-md-6">

                                        <label className="form-label">
                                            Level
                                        </label>

                                        <select
                                            className="form-select"
                                            value={editLevel}
                                            onChange={(e) =>
                                                setEditLevel(e.target.value)
                                            }
                                        >

                                            <option value="beginner">
                                                Beginner
                                            </option>

                                            <option value="intermediate">
                                                Intermediate
                                            </option>

                                            <option value="advanced">
                                                Advanced
                                            </option>

                                        </select>

                                    </div>


                                    {/* Language */}

                                    <div className="col-md-6">

                                        <label className="form-label">
                                            Language
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editLanguage}
                                            onChange={(e) =>
                                                setEditLanguage(e.target.value)
                                            }
                                        />

                                    </div>


                                    {/* Duration */}

                                    <div className="col-md-6">

                                        <label className="form-label">
                                            Duration Hours
                                        </label>

                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-control"
                                            value={editDuration}
                                            onChange={(e) =>
                                                setEditDuration(e.target.value)
                                            }
                                        />

                                    </div>


                                    {/* Status */}

                                    <div className="col-md-6">

                                        <label className="form-label">
                                            Status
                                        </label>

                                        <select
                                            className="form-select"
                                            value={editStatus}
                                            onChange={(e) =>
                                                setEditStatus(e.target.value)
                                            }
                                        >

                                            <option value="draft">
                                                Draft
                                            </option>

                                            <option value="published">
                                                Published
                                            </option>

                                            <option value="archived">
                                                Archived
                                            </option>

                                        </select>

                                    </div>


                                    {/* Featured */}

                                    <div className="col-md-6">

                                        <label className="form-label">
                                            Featured Course
                                        </label>

                                        <select
                                            className="form-select"
                                            value={editFeatured}
                                            onChange={(e) =>
                                                setEditFeatured(
                                                    Number(e.target.value)
                                                )
                                            }
                                        >

                                            <option value={0}>
                                                No
                                            </option>

                                            <option value={1}>
                                                Yes
                                            </option>

                                        </select>

                                    </div>

                                </div>

                            </div>


                            {/* Footer */}

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditCourse(null);
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSaveEdit}
                                >
                                    Save Changes
                                </button>

                            </div>

                        </div>

                    </div>
                </div>
            )}





        </DashboardLayout>
    );
};

export default AdminCourses;

