import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaTimes,
    FaPlay,
    FaCode,
    FaBriefcase,
    FaDesktop,
    FaPalette,
    FaBullhorn,
    FaChartBar,
    FaUser,
    FaHeartbeat,
    FaMusic,
    FaUsers,
    FaBookOpen,
    FaGraduationCap,
    FaArrowRight,
    FaChevronDown,
    FaChevronRight
} from 'react-icons/fa';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import api from '../../services/api';
import './Home.scss';

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [courses, setCourses] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [selectedTab, setSelectedTab] = useState(null);

    const [hoveredCategory, setHoveredCategory] = useState(null);

    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingSubcategories, setLoadingSubcategories] = useState(true);
    const [loadingCourses, setLoadingCourses] = useState(true);

    const [error, setError] = useState('');
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);
    const [showOfferBar, setShowOfferBar] = useState(true);

    const courseSliderRef = useRef(null);
    const newCourseSliderRef = useRef(null);

    const heroImage = '/images/home/hero.jpg';

    const getCategoryIcon = (name) => {
        const value = String(name || '').toLowerCase();

        if (value.includes('development') && !value.includes('personal')) {
            return <FaCode />;
        }

        if (value.includes('business')) {
            return <FaBriefcase />;
        }

        if (
            value.includes('software') ||
            value.includes('information technology') ||
            value === 'it'
        ) {
            return <FaDesktop />;
        }

        if (
            value.includes('design') ||
            value.includes('ui') ||
            value.includes('ux')
        ) {
            return <FaPalette />;
        }

        if (value.includes('marketing')) {
            return <FaBullhorn />;
        }

        if (value.includes('data')) {
            return <FaChartBar />;
        }

        if (value.includes('personal')) {
            return <FaUser />;
        }

        if (
            value.includes('health') ||
            value.includes('fitness')
        ) {
            return <FaHeartbeat />;
        }

        if (value.includes('music')) {
            return <FaMusic />;
        }

        return <FaBookOpen />;
    };

    const getCategoryClass = (name) => {
        const value = String(name || '').toLowerCase();

        if (value.includes('development') && !value.includes('personal')) {
            return 'development';
        }

        if (value.includes('business')) {
            return 'business';
        }

        if (
            value.includes('software') ||
            value.includes('information technology') ||
            value === 'it'
        ) {
            return 'software';
        }

        if (
            value.includes('design') ||
            value.includes('ui') ||
            value.includes('ux')
        ) {
            return 'design';
        }

        if (value.includes('marketing')) {
            return 'marketing';
        }

        if (value.includes('data')) {
            return 'data';
        }

        if (value.includes('personal')) {
            return 'personal';
        }

        if (
            value.includes('health') ||
            value.includes('fitness')
        ) {
            return 'health';
        }

        if (value.includes('music')) {
            return 'music';
        }

        return 'more';
    };

    const fetchCategories = async () => {
        setLoadingCategories(true);

        try {
            const response = await api.get('/categories/list.php');

            if (response.data?.status) {
                const data =
                    response.data?.data?.categories ||
                    response.data?.data ||
                    [];

                setCategories(
                    Array.isArray(data) ? data : []
                );
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error(
                'Category Fetch Error:',
                error
            );

            setCategories([]);
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchSubcategories = async () => {
        setLoadingSubcategories(true);

        try {
            const response =
                await api.get(
                    '/subcategories/list.php'
                );

            if (response.data?.status) {
                const data =
                    response.data?.data?.subcategories ||
                    response.data?.data ||
                    [];

                setSubcategories(
                    Array.isArray(data) ? data : []
                );
            } else {
                setSubcategories([]);
            }
        } catch (error) {
            console.error(
                'Subcategory Fetch Error:',
                error
            );

            setSubcategories([]);
        } finally {
            setLoadingSubcategories(false);
        }
    };

    const fetchCourses = async () => {
        setLoadingCourses(true);
        setError('');

        try {
            const response =
                await api.get('/courses/list.php');

            if (response.data?.status) {
                const data =
                    response.data?.data?.courses ||
                    response.data?.data ||
                    [];

                setCourses(
                    Array.isArray(data) ? data : []
                );
            } else {
                setCourses([]);
                setError(
                    response.data?.message ||
                    'Unable to load courses'
                );
            }
        } catch (error) {
            console.error(
                'Course Fetch Error:',
                error
            );

            setCourses([]);

            setError(
                error.response?.data?.message ||
                'Unable to load courses'
            );
        } finally {
            setLoadingCourses(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchSubcategories();
        fetchCourses();
    }, []);

    const normalizedCourses = useMemo(() => {
        return courses
            .map((course) => {
                const enrollmentCount = Number(
                    course.total_students ??
                    course.enrollment_count ??
                    course.enrolled_count ??
                    0
                );

                const reviewCount = Number(
                    course.review_count ??
                    course.total_reviews ??
                    0
                );

                const rating = Number(
                    course.average_rating ??
                    course.rating ??
                    0
                );

                // price = original price
                const originalPrice = Number(
                    course.price || 0
                );

                // discount_price = discount amount
                const discountAmount = Number(
                    course.discount_price || 0
                );

                // final price = original price - discount
                const finalPrice =
                    discountAmount > 0 &&
                        discountAmount < originalPrice
                        ? originalPrice - discountAmount
                        : originalPrice;

                const actualDiscount =
                    discountAmount > 0 &&
                        discountAmount < originalPrice
                        ? discountAmount
                        : 0;

                const teacherName =
                    course.teacher_name ??
                    course.instructor_name ??
                    course.user_name ??
                    'Instructor';

                let teacherImage =
                    course.teacher_image_url ||
                    course.teacher_image ||
                    course.instructor_image_url ||
                    course.instructor_image ||
                    course.user_image_url ||
                    course.user_image ||
                    null;

                if (teacherImage) {
                    teacherImage =
                        String(teacherImage).trim();

                    if (
                        !teacherImage.startsWith(
                            'http://'
                        ) &&
                        !teacherImage.startsWith(
                            'https://'
                        )
                    ) {
                        teacherImage =
                            `http://localhost${teacherImage.startsWith('/') ? '' : '/'}${teacherImage}`;
                    }
                }

                let courseImage =
                    course.thumbnail_url ||
                    course.thumbnail ||
                    course.image_url ||
                    course.image ||
                    null;

                if (courseImage) {
                    courseImage =
                        String(courseImage).trim();

                    if (
                        !courseImage.startsWith(
                            'http://'
                        ) &&
                        !courseImage.startsWith(
                            'https://'
                        )
                    ) {
                        courseImage =
                            `http://localhost${courseImage.startsWith('/') ? '' : '/'}${courseImage}`;
                    }
                }

                return {
                    ...course,

                    normalizedEnrollmentCount:
                        enrollmentCount,

                    normalizedReviewCount:
                        reviewCount,

                    normalizedRating:
                        rating,

                    normalizedOriginalPrice:
                        originalPrice,

                    normalizedDiscountAmount:
                        actualDiscount,

                    normalizedFinalPrice:
                        finalPrice,

                    normalizedTeacherName:
                        teacherName,

                    normalizedTeacherImage:
                        teacherImage,

                    normalizedCourseImage:
                        courseImage
                };
            })
            .filter(
                (course) =>
                    course.status === undefined ||
                    course.status === 'published'
            );
    }, [courses]);

    const getCourseCategoryId = (course) => {
        return Number(
            course.category_id ??
            course.category?.id ??
            0
        );
    };

    const getCourseSubcategoryId = (course) => {
        return Number(
            course.subcategory_id ??
            course.sub_category_id ??
            course.subcategory?.id ??
            course.sub_category?.id ??
            0
        );
    };

    const filteredCourses = useMemo(() => {
        let result = [...normalizedCourses];

        if (selectedCategory !== null) {
            result = result.filter(
                (course) =>
                    getCourseCategoryId(course) ===
                    Number(selectedCategory)
            );
        }

        if (selectedSubcategory !== null) {
            result = result.filter(
                (course) =>
                    getCourseSubcategoryId(course) ===
                    Number(selectedSubcategory)
            );
        }

        if (
            selectedTab !== null &&
            selectedCategory === null &&
            selectedSubcategory === null
        ) {
            result = result.filter(
                (course) =>
                    getCourseCategoryId(course) ===
                    Number(selectedTab)
            );
        }

        return result;
    }, [
        normalizedCourses,
        selectedCategory,
        selectedSubcategory,
        selectedTab
    ]);

    const bestSellerCourses = useMemo(() => {
        return [...normalizedCourses].sort(
            (a, b) =>
                b.normalizedEnrollmentCount -
                a.normalizedEnrollmentCount
        );
    }, [normalizedCourses]);

    const newCourses = useMemo(() => {
        return [...normalizedCourses]
            .sort((a, b) => {
                const dateA = new Date(
                    a.created_at ?? 0
                ).getTime();

                const dateB = new Date(
                    b.created_at ?? 0
                ).getTime();

                return dateB - dateA;
            })
            .slice(0, 4);
    }, [normalizedCourses]);

    const displayedCourses = useMemo(() => {
        if (
            selectedCategory === null &&
            selectedSubcategory === null &&
            selectedTab === null
        ) {
            return bestSellerCourses;
        }

        return filteredCourses;
    }, [
        selectedCategory,
        selectedSubcategory,
        selectedTab,
        bestSellerCourses,
        filteredCourses
    ]);

    const getSubcategoriesForCategory = (
        categoryId
    ) => {
        return subcategories.filter(
            (subcategory) =>
                Number(subcategory.category_id) ===
                Number(categoryId)
        );
    };

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(Number(categoryId));
        setSelectedSubcategory(null);
        setSelectedTab(null);

        setShowCategoryMenu(false);
        setHoveredCategory(null);

        setTimeout(() => {
            document
                .querySelector(
                    '.home-courses-section'
                )
                ?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
        }, 100);
    };

    const handleSubcategoryClick = (
        subcategoryId
    ) => {
        const id = Number(subcategoryId);

        const selectedSub =
            subcategories.find(
                (subcategory) =>
                    Number(subcategory.id) === id
            );

        setSelectedSubcategory(id);

        if (selectedSub?.category_id) {
            setSelectedCategory(
                Number(
                    selectedSub.category_id
                )
            );
        }

        setSelectedTab(null);
        setShowCategoryMenu(false);
        setHoveredCategory(null);

        setTimeout(() => {
            document
                .querySelector(
                    '.home-courses-section'
                )
                ?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
        }, 100);
    };

    const handleTabClick = (categoryId) => {
        setSelectedTab(Number(categoryId));
        setSelectedCategory(null);
        setSelectedSubcategory(null);

        if (courseSliderRef.current) {
            courseSliderRef.current.scrollTo({
                left: 0,
                behavior: 'smooth'
            });
        }
    };

    const clearCategoryFilter = () => {
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setSelectedTab(null);

        if (courseSliderRef.current) {
            courseSliderRef.current.scrollTo({
                left: 0,
                behavior: 'smooth'
            });
        }
    };

    const getCourseUrl = (course) => {
        return course.slug
            ? `/courses/${course.slug}`
            : `/courses/${course.id}`;
    };

    const formatPrice = (price) => {
        return `₹${Number(
            price || 0
        ).toLocaleString('en-IN')}`;
    };

    const getEnrollmentText = (count) => {
        const value = Number(count || 0);

        if (value >= 1000) {
            return `${(
                value / 1000
            ).toFixed(
                value >= 10000 ? 0 : 1
            )}K+ Enrolled`;
        }

        return `${value}+ Enrolled`;
    };

    const getCourseBadge = (course) => {
        if (
            bestSellerCourses[0]?.id ===
            course.id
        ) {
            return {
                text: 'Bestseller',
                type: 'bestseller'
            };
        }

        if (
            newCourses[0]?.id ===
            course.id
        ) {
            return {
                text: 'New',
                type: 'new'
            };
        }

        return {
            text: 'Popular',
            type: 'popular'
        };
    };

    const handleImageError = (event) => {
        if (
            event.currentTarget.dataset
                .fallback
        ) {
            return;
        }

        event.currentTarget.dataset.fallback =
            'true';

        event.currentTarget.src =
            '/images/courses/default-course.jpg';
    };

    const renderCourseCard = (
        course,
        type = 'slider'
    ) => {
        const badge =
            getCourseBadge(course);

        const hasDiscount =
            course.normalizedDiscountAmount >
            0;

        return (
            <div
                className={
                    type === 'new'
                        ? 'home-new-course-card'
                        : 'home-course-card'
                }
                key={`${type}-${course.id}`}
            >
                <Link
                    to={getCourseUrl(course)}
                    className={
                        type === 'new'
                            ? 'home-new-course-image'
                            : 'home-course-image'
                    }
                >
                    <img
                        src={
                            course.normalizedCourseImage ||
                            '/images/courses/default-course.jpg'
                        }
                        alt={
                            course.title ||
                            'Course'
                        }
                        onError={
                            handleImageError
                        }
                    />

                    <span
                        className={`home-course-enrolled ${badge.type}`}
                    >
                        {getEnrollmentText(
                            course.normalizedEnrollmentCount
                        )}
                    </span>
                </Link>

                <div
                    className={
                        type === 'new'
                            ? 'home-new-course-content'
                            : 'home-course-content'
                    }
                >
                    <Link
                        to={getCourseUrl(course)}
                        className={
                            type === 'new'
                                ? 'home-new-course-title'
                                : 'home-course-title'
                        }
                    >
                        {course.title ||
                            'Untitled Course'}
                    </Link>

                    <div className="home-course-instructor">
                        {course.normalizedTeacherImage ? (
                            <img
                                src={
                                    course.normalizedTeacherImage
                                }
                                alt={
                                    course.normalizedTeacherName
                                }
                                className="home-instructor-avatar"
                                onError={(
                                    event
                                ) => {
                                    event.currentTarget.style.display =
                                        'none';

                                    if (
                                        event
                                            .currentTarget
                                            .nextElementSibling
                                    ) {
                                        event.currentTarget.nextElementSibling.style.display =
                                            'flex';
                                    }
                                }}
                            />
                        ) : null}

                        <span
                            className="home-instructor-avatar"
                            style={{
                                display:
                                    course.normalizedTeacherImage
                                        ? 'none'
                                        : 'flex'
                            }}
                        >
                            <FaUser />
                        </span>

                        <span>
                            {
                                course.normalizedTeacherName
                            }
                        </span>
                    </div>

                    <div className="home-course-rating">
                        <strong>
                            {course.normalizedRating >
                                0
                                ? course.normalizedRating.toFixed(
                                    1
                                )
                                : '0.0'}
                        </strong>

                        <span className="home-star">
                            ★
                        </span>

                        <span>
                            (
                            {
                                course.normalizedReviewCount
                            }
                            )
                        </span>
                    </div>

                    <div className="home-course-bottom">
                        <div className="home-course-price">
                            <strong>
                                {formatPrice(
                                    course.normalizedFinalPrice
                                )}
                            </strong>

                            {hasDiscount && (
                                <del>
                                    {formatPrice(
                                        course.normalizedOriginalPrice
                                    )}
                                </del>
                            )}

                            {hasDiscount && (
                                <span className="home-course-discount">
                                    {formatPrice(
                                        course.normalizedDiscountAmount
                                    )}{' '}
                                    OFF
                                </span>
                            )}
                        </div>

                        <span
                            className={`home-course-badge ${badge.type}`}
                        >
                            {badge.text}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const visibleCategories =
        categories.slice(0, 9);

    const totalStudents = normalizedCourses.reduce(
        (total, course) => {
            return total + Number(
                course.total_students ??
                course.enrollment_count ??
                course.enrolled_count ??
                0
            );
        },
        0
    );

    const totalCourses = normalizedCourses.length;

    const totalTeachers = new Set(
        normalizedCourses
            .map(
                (course) =>
                    course.teacher_id ??
                    course.user_id ??
                    course.teacher_name
            )
            .filter(Boolean)
    ).size;

    const slideCourses = (direction) => {
        if (!courseSliderRef.current) {
            return;
        }

        const container =
            courseSliderRef.current;

        const card =
            container.querySelector(
                '.home-course-card'
            );

        if (!card) {
            return;
        }

        const cardWidth =
            card.getBoundingClientRect()
                .width;

        const gap = 20;

        container.scrollBy({
            left:
                direction === 'left'
                    ? -(cardWidth + gap)
                    : cardWidth + gap,
            behavior: 'smooth'
        });
    };

    const slideNewCourses = (direction) => {
        if (!newCourseSliderRef.current) {
            return;
        }

        const container =
            newCourseSliderRef.current;

        const card =
            container.querySelector(
                '.home-new-course-card'
            );

        if (!card) {
            return;
        }

        const cardWidth =
            card.getBoundingClientRect()
                .width;

        const gap = 20;

        container.scrollBy({
            left:
                direction === 'left'
                    ? -(cardWidth + gap)
                    : cardWidth + gap,
            behavior: 'smooth'
        });
    };

    return (
        <div className="home-page">
            {showOfferBar && (
                <div className="home-offer-bar">
                    <div className="home-offer-content">
                        <span>🎉</span>

                        <strong>
                            Special Offer!
                        </strong>

                        <span>
                            Get flat 50% OFF on all
                            courses. Limited time
                            only!
                        </span>

                        <Link
                            to="/courses"
                            className="home-offer-button"
                        >
                            View Offers
                        </Link>
                    </div>

                    <button
                        type="button"
                        className="home-offer-close"
                        onClick={() =>
                            setShowOfferBar(false)
                        }
                    >
                        <FaTimes />
                    </button>
                </div>
            )}

            <Header />

            <div className="home-navigation">
                <div className="home-container">
                    <div className="home-nav-left">
                        <div
                            className="home-category-menu"
                            onMouseLeave={() => {
                                setHoveredCategory(
                                    null
                                );
                                setShowCategoryMenu(
                                    false
                                );
                            }}
                        >
                            <button
                                type="button"
                                className="home-category-button"
                                onClick={() =>
                                    setShowCategoryMenu(
                                        (prev) =>
                                            !prev
                                    )
                                }
                            >
                                <span className="category-grid-icon">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </span>

                                <span>
                                    Categories
                                </span>

                                <FaChevronDown
                                    size={12}
                                />
                            </button>

                            {showCategoryMenu && (
                                <div className="home-category-dropdown">
                                    {loadingCategories ? (
                                        <div className="p-3 text-muted">
                                            Loading
                                            categories...
                                        </div>
                                    ) : visibleCategories.length ===
                                        0 ? (
                                        <div className="p-3 text-muted">
                                            No categories
                                            available
                                        </div>
                                    ) : (
                                        visibleCategories.map(
                                            (
                                                category
                                            ) => {
                                                const categorySubs =
                                                    getSubcategoriesForCategory(
                                                        category.id
                                                    );

                                                return (
                                                    <div
                                                        key={
                                                            category.id
                                                        }
                                                        className="home-category-dropdown-wrapper"
                                                        onMouseEnter={() =>
                                                            setHoveredCategory(
                                                                Number(
                                                                    category.id
                                                                )
                                                            )
                                                        }
                                                    >
                                                        <button
                                                            type="button"
                                                            className="home-dropdown-item"
                                                            onClick={() =>
                                                                handleCategoryClick(
                                                                    category.id
                                                                )
                                                            }
                                                        >
                                                            <span>
                                                                {getCategoryIcon(
                                                                    category.name
                                                                )}
                                                            </span>

                                                            <span>
                                                                {
                                                                    category.name
                                                                }
                                                            </span>

                                                            <FaChevronRight />
                                                        </button>

                                                        {hoveredCategory ===
                                                            Number(
                                                                category.id
                                                            ) && (
                                                                <div
                                                                    className="home-subcategory-dropdown"
                                                                    onMouseEnter={() =>
                                                                        setHoveredCategory(
                                                                            Number(
                                                                                category.id
                                                                            )
                                                                        )
                                                                    }
                                                                >
                                                                    <div className="home-subcategory-title">
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </div>

                                                                    {loadingSubcategories ? (
                                                                        <div className="home-subcategory-empty">
                                                                            Loading...
                                                                        </div>
                                                                    ) : categorySubs.length ===
                                                                        0 ? (
                                                                        <div className="home-subcategory-empty">
                                                                            No
                                                                            subcategories
                                                                        </div>
                                                                    ) : (
                                                                        categorySubs.map(
                                                                            (
                                                                                subcategory
                                                                            ) => (
                                                                                <button
                                                                                    type="button"
                                                                                    key={
                                                                                        subcategory.id
                                                                                    }
                                                                                    className={`home-subcategory-item ${Number(
                                                                                        selectedSubcategory
                                                                                    ) ===
                                                                                            Number(
                                                                                                subcategory.id
                                                                                            )
                                                                                            ? 'active'
                                                                                            : ''
                                                                                        }`}
                                                                                    onClick={() =>
                                                                                        handleSubcategoryClick(
                                                                                            subcategory.id
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        subcategory.name
                                                                                    }

                                                                                    <FaChevronRight
                                                                                        size={
                                                                                            10
                                                                                        }
                                                                                    />
                                                                                </button>
                                                                            )
                                                                        )
                                                                    )}
                                                                </div>
                                                            )}
                                                    </div>
                                                );
                                            }
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        <nav className="home-main-nav">
                            <Link
                                to="/"
                                className="active"
                            >
                                Home
                            </Link>

                            <Link to="/courses">
                                Courses
                            </Link>

                            <Link to="/about-us">
                                About Us
                            </Link>

                            <Link to="/become-instructor">
                                Become an
                                Instructor
                            </Link>

                            <Link to="/contact-us">
                                Contact Us
                            </Link>
                        </nav>
                    </div>

                    <Link
                        to="/business"
                        className="home-business-link"
                    >
                        For Business
                    </Link>
                </div>
            </div>

            <main>
                <section className="home-hero">
                    <div className="home-container">
                        <div className="home-hero-wrapper">
                            <div className="home-hero-content">
                                <h1>
                                    Learn new
                                    skills.
                                    <br />
                                    <span>
                                        Advance
                                    </span>{' '}
                                    your career.
                                </h1>

                                <p>
                                    Explore courses
                                    from expert
                                    instructors.
                                    <br />
                                    Learn at your own
                                    pace. Get future
                                    ready.
                                </p>

                                <div className="home-hero-buttons">
                                    <Link
                                        to="/courses"
                                        className="home-primary-button"
                                    >
                                        Explore Courses
                                    </Link>

                                    <button
                                        type="button"
                                        className="home-secondary-button"
                                    >
                                        <FaPlay
                                            size={12}
                                        />
                                        Watch Video
                                    </button>
                                </div>

                                <div className="home-hero-features">
                                    <div className="home-feature">
                                        <div className="home-feature-icon">
                                            <FaUsers />
                                        </div>

                                        <div>
                                            <strong>
                                                Expert
                                                Instructors
                                            </strong>

                                            <span>
                                                Learn from
                                                industry
                                                experts
                                            </span>
                                        </div>
                                    </div>

                                    <div className="home-feature">
                                        <div className="home-feature-icon">
                                            <FaBookOpen />
                                        </div>

                                        <div>
                                            <strong>
                                                Lifetime
                                                Access
                                            </strong>

                                            <span>
                                                Learn on
                                                your
                                                schedule
                                            </span>
                                        </div>
                                    </div>

                                    <div className="home-feature">
                                        <div className="home-feature-icon">
                                            <FaGraduationCap />
                                        </div>

                                        <div>
                                            <strong>
                                                Certificate
                                            </strong>

                                            <span>
                                                Earn
                                                completion
                                                certificate
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="home-hero-image-wrapper">
                                <img
                                    src={heroImage}
                                    alt="Students learning online"
                                    className="home-hero-image"
                                />

                                <div className="home-hero-stats">
                                    <div className="home-stat-item">
                                        <div className="home-stat-icon purple">
                                            <FaUsers />
                                        </div>

                                        <div>
                                            <strong>
                                                {totalStudents}+
                                            </strong>

                                            <span>
                                                Enrollments
                                            </span>
                                        </div>
                                    </div>

                                    <div className="home-stat-item">
                                        <div className="home-stat-icon green">
                                            <FaBookOpen />
                                        </div>

                                        <div>
                                            <strong>
                                                {totalCourses}+
                                            </strong>

                                            <span>
                                                Courses
                                            </span>
                                        </div>
                                    </div>

                                    <div className="home-stat-item">
                                        <div className="home-stat-icon orange">
                                            <FaGraduationCap />
                                        </div>

                                        <div>
                                            <strong>
                                                {totalTeachers}+
                                            </strong>

                                            <span>
                                                Instructors
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="home-category-icons">
                    <div className="home-container">
                        <div className="home-category-list">
                            {loadingCategories ? (
                                <div className="text-muted">
                                    Loading
                                    categories...
                                </div>
                            ) : visibleCategories.length ===
                                0 ? (
                                <div className="text-muted">
                                    No categories
                                    available
                                </div>
                            ) : (
                                visibleCategories.map(
                                    (
                                        category
                                    ) => (
                                        <button
                                            type="button"
                                            key={
                                                category.id
                                            }
                                            className={`home-category-card ${Number(
                                                selectedCategory
                                            ) ===
                                                    Number(
                                                        category.id
                                                    )
                                                    ? 'selected'
                                                    : ''
                                                }`}
                                            onClick={() =>
                                                handleCategoryClick(
                                                    category.id
                                                )
                                            }
                                        >
                                            <div
                                                className={`home-category-icon ${getCategoryClass(
                                                    category.name
                                                )}`}
                                            >
                                                {getCategoryIcon(
                                                    category.name
                                                )}
                                            </div>

                                            <span>
                                                {
                                                    category.name
                                                }
                                            </span>
                                        </button>
                                    )
                                )
                            )}
                        </div>
                    </div>
                </section>

                <section className="home-courses-section">
                    <div className="home-container">
                        <div className="home-course-tabs">
                            <button
                                type="button"
                                className={
                                    selectedTab ===
                                        null &&
                                        selectedCategory ===
                                        null
                                        ? 'home-course-tab active'
                                        : 'home-course-tab'
                                }
                                onClick={
                                    clearCategoryFilter
                                }
                            >
                                Best Sellers
                            </button>

                            {categories
                                .slice(0, 8)
                                .map(
                                    (
                                        category
                                    ) => (
                                        <button
                                            type="button"
                                            key={
                                                category.id
                                            }
                                            className={
                                                Number(
                                                    selectedTab
                                                ) ===
                                                    Number(
                                                        category.id
                                                    )
                                                    ? 'home-course-tab active'
                                                    : 'home-course-tab'
                                            }
                                            onClick={() =>
                                                handleTabClick(
                                                    category.id
                                                )
                                            }
                                        >
                                            {
                                                category.name
                                            }
                                        </button>
                                    )
                                )}
                        </div>

                        <div className="home-course-slider-wrapper">
                            <button
                                type="button"
                                className="home-slider-arrow home-slider-arrow-left"
                                onClick={() =>
                                    slideCourses(
                                        'left'
                                    )
                                }
                                aria-label="Previous courses"
                            >
                                &#10094;
                            </button>

                            <div
                                className="home-course-slider"
                                ref={
                                    courseSliderRef
                                }
                            >
                                {loadingCourses ? (
                                    <div className="home-course-loading">
                                        Loading
                                        courses...
                                    </div>
                                ) : displayedCourses.length ===
                                    0 ? (
                                    <div className="home-course-empty">
                                        No courses
                                        available.
                                    </div>
                                ) : (
                                    displayedCourses.map(
                                        (
                                            course
                                        ) =>
                                            renderCourseCard(
                                                course,
                                                'slider'
                                            )
                                    )
                                )}
                            </div>

                            <button
                                type="button"
                                className="home-slider-arrow home-slider-arrow-right"
                                onClick={() =>
                                    slideCourses(
                                        'right'
                                    )
                                }
                                aria-label="Next courses"
                            >
                                &#10095;
                            </button>
                        </div>

                        <div className="home-show-all">
                            <Link to="/courses">
                                Show all
                                courses
                                <FaArrowRight />
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="home-new-section">
                    <div className="home-container">
                        <div className="home-section-heading">
                            <h2>
                                New Courses
                            </h2>

                            <p>
                                Recently published
                                courses from our
                                instructors.
                            </p>
                        </div>

                        {loadingCourses ? (
                            <div className="home-course-loading">
                                Loading...
                            </div>
                        ) : newCourses.length ===
                            0 ? (
                            <div className="home-course-empty">
                                No new courses
                                available.
                            </div>
                        ) : (
                            <div className="home-new-courses-grid">
                                {newCourses.map(
                                    (
                                        course
                                    ) =>
                                        renderCourseCard(
                                            course,
                                            'new'
                                        )
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Home;