import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loading from '../../components/common/Loading';
import './MyCourses.scss';

const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        api
            .get(`/student/my-courses.php?status=${filter}`)
            .then((res) => {
                console.log('MY COURSES API:', res.data);

                if (res.data.status) {
                    setCourses(
                        Array.isArray(res.data.data)
                            ? res.data.data
                            : []
                    );
                } else {
                    setCourses([]);
                }
            })
            .catch((error) => {
                console.error('My Courses Error:', error);
                setCourses([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [filter]);

    const getThumbnailUrl = (thumbnail) => {
        if (!thumbnail) {
            return null;
        }

        const value = String(thumbnail).trim();

        if (!value) {
            return null;
        }

        if (
            value.startsWith('http://') ||
            value.startsWith('https://')
        ) {
            return value;
        }

        if (value.startsWith('/uploads/courses/')) {
            return `http://localhost/php-lms-project/backend${value}`;
        }

        if (value.startsWith('uploads/courses/')) {
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

    const handleImageError = (e, course) => {
        console.error(
            'My Course Thumbnail Load Failed:',
            course.thumbnail
        );

        e.currentTarget.style.display = 'none';

        const fallback =
            e.currentTarget.parentElement.querySelector(
                '.student-course-thumbnail-fallback'
            );

        if (fallback) {
            fallback.style.display = 'flex';
        }
    };

    return (
        <DashboardLayout>

            <div className="student-my-courses-page">

                <div className="student-my-courses-header">

                    <h2>
                        My Courses
                    </h2>

                    <div className="student-course-filter">

                        <button
                            type="button"
                            className={`btn ${
                                filter === 'all'
                                    ? 'btn-primary'
                                    : 'btn-outline-primary'
                            }`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>

                        <button
                            type="button"
                            className={`btn ${
                                filter === 'active'
                                    ? 'btn-primary'
                                    : 'btn-outline-primary'
                            }`}
                            onClick={() => setFilter('active')}
                        >
                            In Progress
                        </button>

                        <button
                            type="button"
                            className={`btn ${
                                filter === 'completed'
                                    ? 'btn-primary'
                                    : 'btn-outline-primary'
                            }`}
                            onClick={() => setFilter('completed')}
                        >
                            Completed
                        </button>

                    </div>

                </div>

                {loading ? (

                    <Loading />

                ) : (

                    <div className="student-my-courses-grid">

                        {courses.map((course) => {

                            const thumbnailUrl =
                                getThumbnailUrl(course.thumbnail);

                            const progress =
                                Number(course.progress) || 0;

                            const isCompleted =
                                progress >= 100;

                            const courseId =
                                course.course_id || course.id;

                            return (

                                <div
                                    className="student-course-col"
                                    key={
                                        course.enrollment_id ||
                                        courseId
                                    }
                                >

                                    <div className="card student-course-card shadow-sm">

                                        <div className="student-course-image">

                                            {thumbnailUrl && (

                                                <img
                                                    src={thumbnailUrl}
                                                    alt={
                                                        course.title ||
                                                        'Course'
                                                    }
                                                    onError={(e) =>
                                                        handleImageError(
                                                            e,
                                                            course
                                                        )
                                                    }
                                                />

                                            )}

                                            <div
                                                className="student-course-thumbnail-fallback"
                                                style={{
                                                    display: thumbnailUrl
                                                        ? 'none'
                                                        : 'flex'
                                                }}
                                            >

                                                <div className="text-center px-3">

                                                    <div className="text-white fw-bold">
                                                        {course.title ||
                                                            'Course'}
                                                    </div>

                                                    <small className="text-white-50">
                                                        Course Thumbnail
                                                    </small>

                                                </div>

                                            </div>

                                        </div>

                                        <div className="card-body student-course-body">

                                            <h5 className="student-course-title">
                                                {course.title ||
                                                    'Untitled Course'}
                                            </h5>

                                            <p className="student-course-teacher text-muted small">
                                                By{' '}
                                                {course.teacher_name || '-'}
                                            </p>

                                            <div
                                                className="progress student-course-progress"
                                                role="progressbar"
                                                aria-valuenow={progress}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            >

                                                <div
                                                    className="progress-bar bg-success"
                                                    style={{
                                                        width: `${Math.min(
                                                            progress,
                                                            100
                                                        )}%`
                                                    }}
                                                />

                                            </div>

                                            <small className="student-course-progress-text text-muted">

                                                {course.completed_lessons || 0}
                                                {' / '}
                                                {course.total_lessons || 0}
                                                {' lessons • '}
                                                {progress}%

                                            </small>

                                            <div className="student-course-actions">

                                                {!isCompleted && (

                                                    <Link
                                                        to={`/student/learn/${courseId}`}
                                                        className="btn btn-sm btn-primary"
                                                    >
                                                        Continue
                                                    </Link>

                                                )}

                                                {isCompleted && (

                                                    <Link
                                                        to={`/student/learn/${courseId}`}
                                                        className="btn btn-sm btn-success"
                                                    >
                                                        Course Completed
                                                    </Link>

                                                )}

                                                <Link
                                                    to={`/student/reviews/${courseId}`}
                                                    className="btn btn-sm btn-primary"
                                                >
                                                    Reviews
                                                </Link>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            );
                        })}

                        {courses.length === 0 && (

                            <div className="student-no-courses">

                                <div className="card student-no-courses-card border-0 shadow-sm">

                                    <div className="card-body text-center">

                                        <h5 className="mb-2">
                                            No Courses Found
                                        </h5>

                                        <p className="text-muted mb-0">
                                            No published courses found.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        )}

                    </div>

                )}

            </div>

        </DashboardLayout>
    );
};

export default MyCourses;