import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Loading from '../../components/common/Loading';

const CourseList = () => {
const [courses, setCourses] = useState([]);
const [categories, setCategories] = useState([]);
const [loading, setLoading] = useState(true);

const [filters, setFilters] = useState({
search: '',
category_id: '',
level: '',
page: 1
});

useEffect(() => {
api.get('/categories/list.php')
.then(res => {
if (res.data.status) {
setCategories(res.data.data || []);
}
})
.catch(error => {
console.error('Category error:', error);
setCategories([]);
});
}, []);

useEffect(() => {
setLoading(true);

const params = new URLSearchParams(filters).toString();

api.get(`/courses/list.php?${params}`)
  .then(res => {
    console.log('COURSES API:', res.data);

    if (res.data.status) {
      setCourses(res.data.data?.courses || []);
    } else {
      setCourses([]);
    }
  })
  .catch(error => {
    console.error('Courses error:', error);
    setCourses([]);
  })
  .finally(() => {
    setLoading(false);
  });

}, [filters]);

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

if (value.startsWith('/php-lms-project/backend/uploads/courses/')) {
  return `http://localhost${value}`;
}

return `http://localhost/php-lms-project/backend/uploads/courses/${value}`;

};

const handleImageError = (e, course) => {
console.error(
'Thumbnail load failed:',
course.thumbnail
);

e.currentTarget.style.display = 'none';

const fallback =
  e.currentTarget.parentElement.querySelector(
    '.thumbnail-fallback'
  );

if (fallback) {
  fallback.style.display = 'flex';
}

};

return (
<div className="d-flex flex-column min-vh-100">

  <Header />

  <div className="container my-5 flex-grow-1">

  
<h2
  className="mb-4"
  style={{ cursor: 'pointer' }}
  onClick={() =>
    setFilters({
      search: '',
      category_id: '',
      level: '',
      page: 1
    })
  }
>
  All Courses
</h2>



    <div className="row mb-4 g-3">

      <div className="col-md-4">

        <input
          type="text"
          className="form-control"
          placeholder="Search courses..."
          value={filters.search}
          onChange={(e) =>
            setFilters({
              ...filters,
              search: e.target.value,
              page: 1
            })
          }
        />

      </div>

      <div className="col-md-3">

        <select
          className="form-select"
          value={filters.category_id}
          onChange={(e) =>
            setFilters({
              ...filters,
              category_id: e.target.value,
              page: 1
            })
          }
        >

          <option value="">
            All Categories
          </option>

          {categories.map(category => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}

        </select>

      </div>

      <div className="col-md-3">

        <select
          className="form-select"
          value={filters.level}
          onChange={(e) =>
            setFilters({
              ...filters,
              level: e.target.value,
              page: 1
            })
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

      <div className="row g-4">

        {courses.map(course => {

          const thumbnailUrl =
            getThumbnailUrl(course.thumbnail);

          const price = Number(course.price) || 0;

          const discount =
            Number(course.discount_price) || 0;

          const finalPrice =
            discount > 0
              ? Math.max(0, price - discount)
              : price;

          return (

            <div
              className="col-md-4"
              key={course.id}
            >

              <div className="card h-100 shadow-sm overflow-hidden">

                <div
                  className="position-relative bg-light"
                  style={{
                    height: '200px',
                    overflow: 'hidden'
                  }}
                >

                  {thumbnailUrl && (

                    <img
                      src={thumbnailUrl}
                      alt={course.title || 'Course'}
                      className="w-100 h-100"
                      style={{
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={(e) =>
                        handleImageError(e, course)
                      }
                    />

                  )}

                  <div
                    className="thumbnail-fallback w-100 h-100 bg-secondary align-items-center justify-content-center"
                    style={{
                      display: thumbnailUrl
                        ? 'none'
                        : 'flex'
                    }}
                  >

                    <div className="text-center px-3">

                      <div
                        className="text-white fw-bold"
                        style={{
                          fontSize: '18px'
                        }}
                      >
                        {course.title || 'Course'}
                      </div>

                      <small className="text-white-50">
                        Course Thumbnail
                      </small>

                    </div>

                  </div>

                </div>

                <div className="card-body d-flex flex-column">

                  <span className="badge bg-primary mb-2 align-self-start">
                    {course.level || 'Beginner'}
                  </span>

                  <h5 className="card-title">
                    {course.title}
                  </h5>

                  <p className="card-text text-muted small flex-grow-1">

                    {course.short_description
                      ? course.short_description.length > 80
                        ? `${course.short_description.substring(0, 80)}...`
                        : course.short_description
                      : 'Learn this course and improve your skills.'
                    }

                  </p>

                  <div className="d-flex justify-content-between align-items-center mt-2">

                    <div>

                      {discount > 0 ? (

                        <div className="d-flex align-items-center flex-wrap gap-2">

                          <span className="text-danger fw-bold fs-5">
                            ₹{finalPrice}
                          </span>

                          <small className="text-muted text-decoration-line-through">
                            ₹{price}
                          </small>

                          <span className="badge bg-success">
                            ₹{discount} OFF
                          </span>

                        </div>

                      ) : (

                        <span className="fw-bold fs-5">
                          ₹{price}
                        </span>

                      )}

                    </div>

                    <Link
                      to={`/courses/${course.slug}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      View
                    </Link>

                  </div>

                </div>

              </div>

            </div>

          );
        })}

        {courses.length === 0 && (

          <div className="col-12">

            <div className="alert alert-info">
              No courses found.
            </div>

          </div>

        )}

      </div>

    )}

  </div>

  <Footer />

</div>

);
};

export default CourseList;