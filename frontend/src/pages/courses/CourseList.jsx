
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Loading from '../../components/common/Loading';
import { FaArrowLeft } from 'react-icons/fa';
import './CourseList.scss';

const CourseList = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const getFiltersFromUrl = () => {
        const params = new URLSearchParams(location.search);

        return {
            search: params.get('search') || '',
            category_id: params.get('category_id') || '',
            level: params.get('level') || '',
            page: Math.max(
                1,
                Number(params.get('page')) || 1
            )
        };
    };

    const [filters, setFilters] = useState(
        getFiltersFromUrl()
    );

    const [courseSearch, setCourseSearch] = useState(
        getFiltersFromUrl().search
    );

    useEffect(() => {
        api.get('/categories/list.php')
            .then(res => {
                if (res.data?.status) {
                    setCategories(
                        res.data.data || []
                    );
                } else {
                    setCategories([]);
                }
            })
            .catch(error => {
                console.error(
                    'Category error:',
                    error
                );

                setCategories([]);
            });
    }, []);

    useEffect(() => {
        const nextFilters = getFiltersFromUrl();

        setFilters(nextFilters);
        setCourseSearch(nextFilters.search);
    }, [location.search]);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);

            try {
                const params = new URLSearchParams();

                if (filters.search.trim() !== '') {
                    params.set(
                        'search',
                        filters.search.trim()
                    );
                }

                if (filters.category_id !== '') {
                    params.set(
                        'category_id',
                        filters.category_id
                    );
                }

                if (filters.level !== '') {
                    params.set(
                        'level',
                        filters.level
                    );
                }

                params.set(
                    'page',
                    String(filters.page)
                );

                const requestUrl =
                    `/courses/list.php?${params.toString()}`;

                console.log(
                    'COURSES REQUEST:',
                    requestUrl
                );

                const response = await api.get(
                    requestUrl
                );

                console.log(
                    'COURSES RESPONSE:',
                    response.data
                );

                if (response.data?.status) {
                    setCourses(
                        response.data?.data?.courses || []
                    );
                } else {
                    setCourses([]);
                }
            } catch (error) {
                console.error(
                    'Courses error:',
                    error
                );

                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [
        filters.search,
        filters.category_id,
        filters.level,
        filters.page
    ]);

    const updateUrl = (
        search = '',
        category_id = '',
        level = '',
        page = 1
    ) => {
        const params = new URLSearchParams();

        const cleanSearch =
            String(search || '').trim();

        const cleanCategory =
            String(category_id || '');

        const cleanLevel =
            String(level || '');

        if (cleanSearch !== '') {
            params.set(
                'search',
                cleanSearch
            );
        }

        if (cleanCategory !== '') {
            params.set(
                'category_id',
                cleanCategory
            );
        }

        if (cleanLevel !== '') {
            params.set(
                'level',
                cleanLevel
            );
        }

        params.set(
            'page',
            String(page)
        );

        navigate(
            `/courses?${params.toString()}`,
            {
                replace: true
            }
        );
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;

        setCourseSearch(value);

        updateUrl(
            value,
            filters.category_id,
            filters.level,
            1
        );
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;

        updateUrl(
            filters.search,
            value,
            filters.level,
            1
        );
    };

    const handleLevelChange = (e) => {
        const value = e.target.value;

        updateUrl(
            filters.search,
            filters.category_id,
            value,
            1
        );
    };

    const resetFilters = () => {
        setCourseSearch('');

        navigate(
            '/courses?page=1',
            {
                replace: true
            }
        );
    };

    const getThumbnailUrl = (thumbnail) => {
        if (!thumbnail) {
            return null;
        }

        const value =
            String(thumbnail).trim();

        if (!value) {
            return null;
        }

        if (
            value.startsWith('http://') ||
            value.startsWith('https://')
        ) {
            return value;
        }

        if (
            value.startsWith(
                '/uploads/courses/'
            )
        ) {
            return `http://localhost/php-lms-project/backend${value}`;
        }

        if (
            value.startsWith(
                'uploads/courses/'
            )
        ) {
            return `http://localhost/php-lms-project/backend/${value}`;
        }

        if (
            value.startsWith(
                '/php-lms-project/backend/uploads/courses/'
            )
        ) {
            return `http://localhost${value}`;
        }

        return `http://localhost/php-lms-project/backend/uploads/courses/${value}`;
    };

    const handleImageError = (
        e,
        course
    ) => {
        console.error(
            'Thumbnail load failed:',
            course.thumbnail
        );

        e.currentTarget.style.display =
            'none';

        const fallback =
            e.currentTarget.parentElement?.querySelector(
                '.course-thumbnail-fallback'
            );

        if (fallback) {
            fallback.style.display =
                'flex';
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100">

            <Header />

            <main className="course-list-page flex-grow-1">

                <div className="course-list-container">

                    <div className="course-list-header">

                        <button
                            type="button"
                            className="course-back-btn"
                            onClick={() =>
                                navigate(-1)
                            }
                        >
                            <FaArrowLeft />

                            <span>
                                Back
                            </span>
                        </button>

                        <h2
                            className="course-list-title"
                            onClick={resetFilters}
                        >
                        </h2>

                    </div>

                    <div className="course-filters">

                        <div className="course-search-box">

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search courses..."
                                value={courseSearch}
                                onChange={
                                    handleSearchChange
                                }
                            />

                        </div>

                        <div className="course-category-box">

                            <select
                                className="form-select"
                                value={
                                    filters.category_id
                                }
                                onChange={
                                    handleCategoryChange
                                }
                            >

                                <option value="">
                                    All Categories
                                </option>

                                {categories.map(
                                    category => (
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

                        <div className="course-level-box">

                            <select
                                className="form-select"
                                value={
                                    filters.level
                                }
                                onChange={
                                    handleLevelChange
                                }
                            >

                                <option value="">
                                    All Levels
                                </option>

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

                    </div>

                    {loading ? (

                        <Loading />

                    ) : (

                        <div className="course-list-grid">

                            {courses.map(
                                course => {

                                    const thumbnailUrl =
                                        getThumbnailUrl(
                                            course.thumbnail_url ||
                                            course.thumbnail
                                        );

                                    const price =
                                        Number(
                                            course.price
                                        ) || 0;

                                    const discount =
                                        Number(
                                            course.discount_price
                                        ) || 0;

                                    const finalPrice =
                                        discount > 0
                                            ? Math.max(
                                                0,
                                                price - discount
                                            )
                                            : price;

                                    return (

                                        <div
                                            className="course-list-col"
                                            key={
                                                course.id
                                            }
                                        >

                                            <div className="card course-list-card shadow-sm">

                                                <div className="course-list-image">

                                                    {thumbnailUrl && (

                                                        <img
                                                            src={
                                                                thumbnailUrl
                                                            }
                                                            alt={
                                                                course.title ||
                                                                'Course'
                                                            }
                                                            onError={
                                                                e =>
                                                                    handleImageError(
                                                                        e,
                                                                        course
                                                                    )
                                                            }
                                                        />

                                                    )}

                                                    <div
                                                        className="course-thumbnail-fallback"
                                                        style={{
                                                            display:
                                                                thumbnailUrl
                                                                    ? 'none'
                                                                    : 'flex'
                                                        }}
                                                    >

                                                        <div className="text-center px-3">

                                                            <div className="course-fallback-title">
                                                                {
                                                                    course.title ||
                                                                    'Course'
                                                                }
                                                            </div>

                                                            <small className="text-white-50">
                                                                Course Thumbnail
                                                            </small>

                                                        </div>

                                                    </div>

                                                </div>

                                                <div className="card-body course-list-card-body">

                                                    <span className="badge bg-primary course-level-badge">
                                                        {
                                                            course.level ||
                                                            'Beginner'
                                                        }
                                                    </span>

                                                    <h5 className="course-card-title">
                                                        {
                                                            course.title ||
                                                            'Untitled Course'
                                                        }
                                                    </h5>

                                                    <p className="course-card-description">
                                                        {
                                                            course.short_description
                                                                ? course.short_description.length > 80
                                                                    ? `${course.short_description.substring(
                                                                        0,
                                                                        80
                                                                    )}...`
                                                                    : course.short_description
                                                                : 'Learn this course and improve your skills.'
                                                        }
                                                    </p>

                                                    <div className="course-card-bottom">

                                                        <div className="course-price">

                                                            {discount > 0 ? (

                                                                <div className="course-discount-price">

                                                                    <span className="course-final-price">
                                                                        ₹
                                                                        {
                                                                            finalPrice
                                                                        }
                                                                    </span>

                                                                    <small className="course-old-price">
                                                                        ₹
                                                                        {
                                                                            price
                                                                        }
                                                                    </small>

                                                                    <span className="badge bg-success course-off-badge">
                                                                        ₹
                                                                        {
                                                                            discount
                                                                        }{' '}
                                                                        OFF
                                                                    </span>

                                                                </div>

                                                            ) : (

                                                                <span className="course-final-price">
                                                                    ₹
                                                                    {
                                                                        price
                                                                    }
                                                                </span>

                                                            )}

                                                        </div>

                                                        <Link
                                                            to={`/courses/${course.slug}`}
                                                            className="btn btn-sm btn-outline-primary course-view-btn"
                                                        >
                                                            View
                                                        </Link>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                            {courses.length === 0 && (

                                <div className="course-no-results">

                                    <div className="alert alert-info mb-0">
                                        No courses found.
                                    </div>

                                </div>

                            )}

                        </div>

                    )}

                </div>

            </main>

            <Footer />

        </div>
    );
};

export default CourseList;

