import React, {
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';
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
    FaChevronRight,
    FaShoppingCart,
    FaHeart,
    FaRegHeart,
    FaCheck
} from 'react-icons/fa';

import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import api from '../../services/api';
import './Home.scss';

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [courses, setCourses] = useState([]);
    const [reviews, setReviews] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [selectedTab, setSelectedTab] = useState(null);
    const [hoveredCategory, setHoveredCategory] = useState(null);

    const [hoveredCourse, setHoveredCourse] = useState(null);

    const [cartItems, setCartItems] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);

    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingSubcategories, setLoadingSubcategories] = useState(true);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingReviews, setLoadingReviews] = useState(true);

    const [error, setError] = useState('');
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);
    const [showOfferBar, setShowOfferBar] = useState(true);

    const courseSliderRef = useRef(null);
    const reviewSliderRef = useRef(null);

    /*
     * Load cart and wishlist from localStorage.
     */
    useEffect(() => {
        const savedCart = JSON.parse(
            localStorage.getItem('lmsCart') || '[]'
        );

        const savedWishlist = JSON.parse(
            localStorage.getItem('lmsWishlist') || '[]'
        );

        setCartItems(
            Array.isArray(savedCart)
                ? savedCart
                : []
        );

        setWishlistItems(
            Array.isArray(savedWishlist)
                ? savedWishlist
                : []
        );
    }, []);

    /*
     * Category icon.
     */
    const getCategoryIcon = (name) => {
        const value = String(name || '').toLowerCase();

        if (
            value.includes('development') &&
            !value.includes('personal')
        ) {
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

    /*
     * Category CSS class.
     */
    const getCategoryClass = (name) => {
        const value = String(name || '').toLowerCase();

        if (
            value.includes('development') &&
            !value.includes('personal')
        ) {
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

    /*
     * Fetch categories.
     */
    const fetchCategories = async () => {
        setLoadingCategories(true);

        try {
            const response = await api.get(
                '/categories/list.php'
            );

            if (response.data?.status) {
                const data =
                    response.data?.data?.categories ||
                    response.data?.data ||
                    [];

                setCategories(
                    Array.isArray(data)
                        ? data
                        : []
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

    /*
     * Fetch subcategories.
     */
    const fetchSubcategories = async () => {
        setLoadingSubcategories(true);

        try {
            const response = await api.get(
                '/subcategories/list.php'
            );

            if (response.data?.status) {
                const data =
                    response.data?.data?.subcategories ||
                    response.data?.data ||
                    [];

                setSubcategories(
                    Array.isArray(data)
                        ? data
                        : []
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

    /*
     * Fetch courses.
     */
    const fetchCourses = async () => {
        setLoadingCourses(true);
        setError('');

        try {
            const response = await api.get(
                '/courses/list.php'
            );

            if (response.data?.status) {
                const data =
                    response.data?.data?.courses ||
                    response.data?.data ||
                    [];

                setCourses(
                    Array.isArray(data)
                        ? data
                        : []
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

    /*
     * Fetch reviews.
     */
    const fetchReviews = async () => {
        setLoadingReviews(true);

        try {
            const response = await api.get(
                '/reviews/home.php'
            );

            if (response.data?.status) {
                const data =
                    response.data?.data?.reviews ||
                    response.data?.data ||
                    [];

                setReviews(
                    Array.isArray(data)
                        ? data
                        : []
                );
            } else {
                setReviews([]);
            }
        } catch (error) {
            console.error(
                'Review Fetch Error:',
                error
            );

            setReviews([]);
        } finally {
            setLoadingReviews(false);
        }
    };

    /*
     * Initial API calls.
     */
    useEffect(() => {
        fetchCategories();
        fetchSubcategories();
        fetchCourses();
        fetchReviews();
    }, []);

    /*
     * Normalize course data.
     */
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

                const originalPrice = Number(
                    course.price || 0
                );

                const discountAmount = Number(
                    course.discount_price || 0
                );

                const hasValidDiscount =
                    discountAmount > 0 &&
                    discountAmount < originalPrice;

                const finalPrice =
                    hasValidDiscount
                        ? originalPrice - discountAmount
                        : originalPrice;

                const actualDiscount =
                    hasValidDiscount
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
                        !teacherImage.startsWith('http://') &&
                        !teacherImage.startsWith('https://')
                    ) {
                        teacherImage =
                            `http://localhost${
                                teacherImage.startsWith('/')
                                    ? ''
                                    : '/'
                            }${teacherImage}`;
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
                        !courseImage.startsWith('http://') &&
                        !courseImage.startsWith('https://')
                    ) {
                        courseImage =
                            `http://localhost${
                                courseImage.startsWith('/')
                                    ? ''
                                    : '/'
                            }${courseImage}`;
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

    /*
     * Course category ID.
     */
    const getCourseCategoryId = (course) => {
        return Number(
            course.category_id ??
            course.category?.id ??
            0
        );
    };

    /*
     * Course subcategory ID.
     */
    const getCourseSubcategoryId = (course) => {
        return Number(
            course.subcategory_id ??
            course.sub_category_id ??
            course.subcategory?.id ??
            course.sub_category?.id ??
            0
        );
    };

    /*
     * Filter courses.
     */
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

    /*
     * Best seller courses.
     */
    const bestSellerCourses = useMemo(() => {
        return [...normalizedCourses].sort(
            (a, b) =>
                b.normalizedEnrollmentCount -
                a.normalizedEnrollmentCount
        );
    }, [normalizedCourses]);

    /*
     * New courses.
     */
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

    /*
     * Displayed courses.
     */
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

    /*
     * Subcategories for category.
     */
    const getSubcategoriesForCategory = (
        categoryId
    ) => {
        return subcategories.filter(
            (subcategory) =>
                Number(subcategory.category_id) ===
                Number(categoryId)
        );
    };

    /*
     * Category click.
     */
    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(Number(categoryId));
        setSelectedSubcategory(null);
        setSelectedTab(null);

        setShowCategoryMenu(false);
        setHoveredCategory(null);

        setTimeout(() => {
            document
                .querySelector('.home-courses-section')
                ?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
        }, 100);
    };

    /*
     * Subcategory click.
     */
    const handleSubcategoryClick = (subcategoryId) => {
        const id = Number(subcategoryId);

        const selectedSub =
            subcategories.find(
                (subcategory) =>
                    Number(subcategory.id) === id
            );

        setSelectedSubcategory(id);

        if (selectedSub?.category_id) {
            setSelectedCategory(
                Number(selectedSub.category_id)
            );
        }

        setSelectedTab(null);
        setShowCategoryMenu(false);
        setHoveredCategory(null);

        setTimeout(() => {
            document
                .querySelector('.home-courses-section')
                ?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
        }, 100);
    };

    /*
     * Course category tab click.
     */
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

    /*
     * Clear course filter.
     */
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

    /*
     * Course URL.
     */
    const getCourseUrl = (course) => {
        return course.slug
            ? `/courses/${course.slug}`
            : `/courses/${course.id}`;
    };

    /*
     * Format price.
     */
    const formatPrice = (price) => {
        return `₹${Number(
            price || 0
        ).toLocaleString('en-IN')}`;
    };

    /*
     * Student image.
     */
    const getStudentImage = (avatar) => {
        if (!avatar) {
            return null;
        }

        const image = String(avatar).trim();

        if (
            image.startsWith('http://') ||
            image.startsWith('https://')
        ) {
            return image;
        }

        return `http://localhost/php-lms-project/backend/uploads/avatars/${image}`;
    };

    /*
     * Enrollment text.
     */
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

    /*
     * Course badge.
     */
    const getCourseBadge = (course) => {
        if (
            bestSellerCourses[0]?.id === course.id
        ) {
            return {
                text: 'Bestseller',
                type: 'bestseller'
            };
        }

        if (
            newCourses[0]?.id === course.id
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

    /*
     * Image fallback.
     */
    const handleImageError = (event) => {
        if (
            event.currentTarget.dataset.fallback
        ) {
            return;
        }

        event.currentTarget.dataset.fallback =
            'true';

        event.currentTarget.src =
            '/images/courses/default-course.jpg';
    };

    /*
     * Review avatar.
     */
    const getReviewAvatar = (review) => {
        let avatar =
            review.student_avatar ||
            review.user_avatar ||
            review.avatar ||
            null;

        if (!avatar) {
            return null;
        }

        avatar = String(avatar).trim();

        if (
            avatar.startsWith('http://') ||
            avatar.startsWith('https://')
        ) {
            return avatar;
        }

        return `http://localhost${
            avatar.startsWith('/')
                ? ''
                : '/'
        }${avatar}`;
    };

    /*
     * Check cart.
     */
    const isCourseInCart = (courseId) => {
        return cartItems.some(
            (item) =>
                Number(item.id) ===
                Number(courseId)
        );
    };

    /*
     * Check wishlist.
     */
    const isCourseInWishlist = (courseId) => {
        return wishlistItems.some(
            (item) =>
                Number(item.id) ===
                Number(courseId)
        );
    };

    /*
     * Add course to cart.
     */
   const handleAddToCart = async (course) => {

    if (isCourseInCart(course.id)) {
        return;
    }

    try {

        const response = await api.post(
            '/cart/add.php',
            {
                course_id: course.id
            }
        );

        if (response.data?.status) {

            const newCartItem = {
                id: course.id,
                title: course.title,
                price: course.normalizedFinalPrice,
                originalPrice: course.normalizedOriginalPrice,
                image: course.normalizedCourseImage,
                teacher: course.normalizedTeacherName
            };

            const updatedCart = [
                ...cartItems,
                newCartItem
            ];

            setCartItems(updatedCart);

            localStorage.setItem(
                'lmsCart',
                JSON.stringify(updatedCart)
            );

        }

    } catch (error) {

        console.error(
            'Add To Cart Error:',
            error
        );

    }
};

    /*
     * Wishlist toggle.
     */
    const handleWishlist = (course) => {
        let updatedWishlist;

        if (
            isCourseInWishlist(course.id)
        ) {
            updatedWishlist =
                wishlistItems.filter(
                    (item) =>
                        Number(item.id) !==
                        Number(course.id)
                );
        } else {
            updatedWishlist = [
                ...wishlistItems,
                {
                    id: course.id,
                    title: course.title,
                    price:
                        course.normalizedFinalPrice,
                    originalPrice:
                        course.normalizedOriginalPrice,
                    image:
                        course.normalizedCourseImage,
                    teacher:
                        course.normalizedTeacherName
                }
            ];
        }

        setWishlistItems(updatedWishlist);

        localStorage.setItem(
            'lmsWishlist',
            JSON.stringify(updatedWishlist)
        );
    };

    /*
     * Enroll now.
     */
    const handleEnrollNow = (course) => {
        window.location.href =
            getCourseUrl(course);
    };

    /*
     * Render course card.
     */
    const renderCourseCard = (
        course,
        type = 'slider',
        index = 0,
        total = 0
    ) => {
        const badge =
            getCourseBadge(course);

        const hasDiscount =
            course.normalizedDiscountAmount > 0;

        const inCart =
            isCourseInCart(course.id);

        const inWishlist =
            isCourseInWishlist(course.id);

        const shouldOpenLeft =
    (type === 'slider' && index >= total - 2) ||
    (type === 'new' && index === total - 1);

        /*
         * Unique hover key for each section.
         */
        const hoverKey =
            `${type}-${course.id}`;

        return (
            <div
                className={
                    type === 'new'
                        ? 'home-new-course-card'
                        : 'home-course-card'
                }
                key={hoverKey}
                onMouseEnter={() =>
                    setHoveredCourse(hoverKey)
                }
                onMouseLeave={() =>
                    setHoveredCourse(null)
                }
            >
                <div
                    className={
                        type === 'new'
                            ? 'home-new-course-image'
                            : 'home-course-image'
                    }
                >
                    <Link
                        to={getCourseUrl(course)}
                        className="home-course-image-link"
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

                    <button
                        type="button"
                        className={`home-course-wishlist-button ${
                            inWishlist
                                ? 'active'
                                : ''
                        }`}
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();

                            handleWishlist(course);
                        }}
                        aria-label="Add to wishlist"
                    >
                        {inWishlist ? (
                            <FaHeart />
                        ) : (
                            <FaRegHeart />
                        )}
                    </button>
                </div>

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
                                onError={(event) => {
                                    event.currentTarget.style.display =
                                        'none';

                                    if (
                                        event
                                            .currentTarget
                                            .nextElementSibling
                                    ) {
                                        event
                                            .currentTarget
                                            .nextElementSibling.style.display =
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

                {hoveredCourse ===
                    hoverKey && (
                    <div
                        className={`home-course-hover-card ${
                            shouldOpenLeft
                                ? 'open-left'
                                : ''
                        }`}
                        onMouseEnter={() =>
                            setHoveredCourse(
                                hoverKey
                            )
                        }
                        onMouseLeave={() =>
                            setHoveredCourse(null)
                        }
                    >
                        <div className="home-course-hover-arrow"></div>

                        <Link
                            to={getCourseUrl(course)}
                            className="home-course-hover-title"
                        >
                            {course.title ||
                                'Untitled Course'}
                        </Link>

                        <p className="home-course-hover-instructor">
                            {
                                course.normalizedTeacherName
                            }
                        </p>

                        <div className="home-course-hover-meta">
                            <strong>
                                {course.normalizedRating >
                                0
                                    ? course.normalizedRating.toFixed(
                                          1
                                      )
                                    : '0.0'}
                            </strong>

                            <span className="home-hover-stars">
                                ★★★★★
                            </span>

                            <span>
                                (
                                {
                                    course.normalizedReviewCount
                                }
                                )
                            </span>
                        </div>

                        <div className="home-course-hover-students">
                            <FaUsers />

                            <span>
                                {getEnrollmentText(
                                    course.normalizedEnrollmentCount
                                )}
                            </span>
                        </div>

                        <ul className="home-course-hover-features">
                            <li>
                                <FaCheck />
                                Lifetime access
                            </li>

                            <li>
                                <FaCheck />
                                Learn at your own pace
                            </li>

                            <li>
                                <FaCheck />
                                Certificate on completion
                            </li>
                        </ul>

                        <div className="home-course-hover-price">
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
                        </div>

                        <div className="home-course-hover-actions">
                            <button
                                type="button"
                                className="home-course-enroll-button"
                                onClick={() =>
                                    handleEnrollNow(
                                        course
                                    )
                                }
                            >
                                Enroll Now
                            </button>

                            <button
                                type="button"
                                className={`home-course-cart-button ${
                                    inCart
                                        ? 'added'
                                        : ''
                                }`}
                                onClick={() =>
                                    handleAddToCart(
                                        course
                                    )
                                }
                            >
                                {inCart ? (
                                    <>
                                        <FaCheck />
                                        Added to Cart
                                    </>
                                ) : (
                                    <>
                                        <FaShoppingCart />
                                        Add to Cart
                                    </>
                                )}
                            </button>
                        </div>

                        <button
                            type="button"
                            className={`home-course-hover-wishlist ${
                                inWishlist
                                    ? 'active'
                                    : ''
                            }`}
                            onClick={() =>
                                handleWishlist(course)
                            }
                        >
                            {inWishlist ? (
                                <FaHeart />
                            ) : (
                                <FaRegHeart />
                            )}

                            {inWishlist
                                ? 'Remove from Wishlist'
                                : 'Add to Wishlist'}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderReviewCard = (review) => {
        const avatar =
            getReviewAvatar(review);

        return (
            <div
                className="home-review-card"
                key={review.id}
            >
                <div className="home-review-header">
                    {avatar ? (
                        <img
                            src={avatar}
                            alt={
                                review.student_name ||
                                'Student'
                            }
                            className="home-review-avatar"
                            onError={(event) => {
                                event.currentTarget.style.display =
                                    'none';

                                if (
                                    event
                                        .currentTarget
                                        .nextElementSibling
                                ) {
                                    event
                                        .currentTarget
                                        .nextElementSibling.style.display =
                                        'flex';
                                }
                            }}
                        />
                    ) : null}

                    <span
                        className="home-review-avatar home-review-avatar-fallback"
                        style={{
                            display: avatar
                                ? 'none'
                                : 'flex'
                        }}
                    >
                        <FaUser />
                    </span>

                    <div className="home-review-user">
                        <strong>
                            {review.student_name ||
                                'Student'}
                        </strong>

                        <span>
                            {review.course_title ||
                                'Course'}
                        </span>
                    </div>
                </div>

                <div className="home-review-rating">
                    {[1, 2, 3, 4, 5].map(
                        (star) => (
                            <span
                                key={star}
                                className={
                                    star <=
                                    Number(
                                        review.rating ||
                                            0
                                    )
                                        ? 'filled'
                                        : ''
                                }
                            >
                                ★
                            </span>
                        )
                    )}

                    <strong>
                        {Number(
                            review.rating ||
                                0
                        ).toFixed(1)}
                    </strong>
                </div>

                <p className="home-review-text">
                    {review.review_text ||
                        'Great course!'}
                </p>

                <div className="home-review-date">
                    {review.created_at
                        ? new Date(
                              review.created_at
                          ).toLocaleDateString(
                              'en-IN',
                              {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                              }
                          )
                        : ''}
                </div>
            </div>
        );
    };

    const visibleCategories =
        categories.slice(0, 9);

    const totalStudents =
        normalizedCourses.reduce(
            (total, course) =>
                total +
                Number(
                    course.total_students ??
                        course.enrollment_count ??
                        course.enrolled_count ??
                        0
                ),
            0
        );

    const totalCourses =
        normalizedCourses.length;

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

    /*
     * Course slider.
     */
    const slideCourses = (direction) => {
        if (
            !courseSliderRef.current
        ) {
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

    /*
     * Review slider.
     */
    const slideReviews = (direction) => {
        if (
            !reviewSliderRef.current
        ) {
            return;
        }

        const container =
            reviewSliderRef.current;

        const card =
            container.querySelector(
                '.home-review-card'
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
                                setHoveredCategory(null);
                                setShowCategoryMenu(false);
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
                                        <div className="home-dropdown-message">
                                            Loading
                                            categories...
                                        </div>
                                    ) : visibleCategories.length ===
                                      0 ? (
                                        <div className="home-dropdown-message">
                                            No categories
                                            available
                                        </div>
                                    ) : (
                                        visibleCategories.map(
                                            (category) => {
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
                                                            <span className="home-dropdown-icon">
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
                                                                                className={`home-subcategory-item ${
                                                                                    Number(
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
                                Become an Instructor
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
                <section className="lms-main-hero">
                    <img
                        src="src/assets/images/2176.jpg"
                        className="lms-main-hero-bg"
                        alt=""
                    />

                    <div className="lms-main-hero-shade"></div>

                    <div className="lms-main-hero-container">
                        <div className="lms-main-hero-left">
                            <span className="lms-main-hero-tag">
                                Learn • Grow • Succeed
                            </span>

                            <h1 className="lms-main-hero-title">
                                Learn new skills.
                                <br />
                                <span>
                                    Advance
                                </span>{' '}
                                your career.
                            </h1>

                            <p className="lms-main-hero-description">
                                Explore courses from
                                expert instructors.
                                Learn at your own pace
                                and build the skills you
                                need for your future.
                            </p>

                            <div className="lms-main-hero-buttons">
                                <Link
                                    to="/courses"
                                    className="lms-main-hero-primary"
                                >
                                    Explore Courses
                                </Link>

                                <button
                                    type="button"
                                    className="lms-main-hero-video"
                                >
                                    <FaPlay size={11} />
                                    Watch Video
                                </button>
                            </div>

                            <div className="lms-main-hero-benefits">
                                <div className="lms-main-hero-benefit">
                                    <span className="lms-main-hero-benefit-icon">
                                        <FaUsers />
                                    </span>

                                    <div>
                                        <strong>
                                            Expert
                                            Instructors
                                        </strong>

                                        <small>
                                            Industry
                                            experts
                                        </small>
                                    </div>
                                </div>

                                <div className="lms-main-hero-benefit">
                                    <span className="lms-main-hero-benefit-icon">
                                        <FaBookOpen />
                                    </span>

                                    <div>
                                        <strong>
                                            Lifetime
                                            Access
                                        </strong>

                                        <small>
                                            Learn anytime
                                        </small>
                                    </div>
                                </div>

                                <div className="lms-main-hero-benefit">
                                    <span className="lms-main-hero-benefit-icon">
                                        <FaGraduationCap />
                                    </span>

                                    <div>
                                        <strong>
                                            Certificate
                                        </strong>

                                        <small>
                                            On completion
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lms-main-hero-right">
                            <div className="lms-main-hero-stat-card">
                                <div className="lms-main-hero-stat-icon">
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

                            <div className="lms-main-hero-stat-card">
                                <div className="lms-main-hero-stat-icon">
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

                            <div className="lms-main-hero-stat-card">
                                <div className="lms-main-hero-stat-icon">
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
                </section>

                <section className="home-category-icons">
                    <div className="home-container">
                        <div className="home-category-list">
                            {loadingCategories ? (
                                <div className="home-loading-text">
                                    Loading
                                    categories...
                                </div>
                            ) : visibleCategories.length ===
                              0 ? (
                                <div className="home-loading-text">
                                    No categories
                                    available
                                </div>
                            ) : (
                                visibleCategories.map(
                                    (category) => (
                                        <button
                                            type="button"
                                            key={
                                                category.id
                                            }
                                            className={`home-category-card ${
                                                Number(
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
                                        null &&
                                    selectedSubcategory ===
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
                                    (category) => (
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
                                        {error ||
                                            'No courses available.'}
                                    </div>
                                ) : (
                                    displayedCourses.map(
                                        (
                                            course,
                                            index
                                        ) =>
                                            renderCourseCard(
                                                course,
                                                'slider',
                                                index,
                                                displayedCourses.length
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
                                Show all courses
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
                                        course,
                                        index
                                    ) =>
                                        renderCourseCard(
                                            course,
                                            'new',
                                            index,
                                            newCourses.length
                                        )
                                )}
                            </div>
                        )}
                    </div>
                </section>

                <section className="home-reviews-section">
                    <div className="home-container">
                        <div className="home-section-heading">
                            <h2>
                                What Our Students
                                Say
                            </h2>

                            <p>
                                See what our students
                                think about their
                                learning experience.
                            </p>
                        </div>

                        {loadingReviews ? (
                            <div className="home-review-loading">
                                Loading reviews...
                            </div>
                        ) : reviews.length ===
                          0 ? (
                            <div className="home-review-empty">
                                <FaBookOpen />

                                <h3>
                                    No reviews yet
                                </h3>

                                <p>
                                    Student reviews
                                    will appear
                                    here once they
                                    are approved.
                                </p>
                            </div>
                        ) : (
                            <div className="home-review-slider-wrapper">
                                <button
                                    type="button"
                                    className="home-review-arrow home-review-arrow-left"
                                    onClick={() =>
                                        slideReviews(
                                            'left'
                                        )
                                    }
                                    aria-label="Previous reviews"
                                >
                                    &#10094;
                                </button>

                                <div
                                    className="home-review-slider"
                                    ref={
                                        reviewSliderRef
                                    }
                                >
                                    {reviews.map(
                                        (review) =>
                                            renderReviewCard(
                                                review
                                            )
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className="home-review-arrow home-review-arrow-right"
                                    onClick={() =>
                                        slideReviews(
                                            'right'
                                        )
                                    }
                                    aria-label="Next reviews"
                                >
                                    &#10095;
                                </button>
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