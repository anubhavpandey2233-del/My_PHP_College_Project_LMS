
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import api from '../../services/api';

const Reviews = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const [course, setCourse] = useState(null);
  const [existingReview, setExistingReview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ==========================================
  // CHECK EXISTING REVIEW
  // ==========================================

  useEffect(() => {
    const checkReview = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get(
          `/reviews/check.php?course_id=${Number(courseId)}`
        );

        if (!response.data?.status) {
          throw new Error(
            response.data?.message ||
            'Failed to check review.'
          );
        }

        const data = response.data?.data || {};

        setCourse(data.course || null);

        if (data.has_reviewed) {
          setExistingReview(data.review || null);
        } else {
          setExistingReview(null);
        }

      } catch (err) {
        console.error('Check Review Error:', err);

        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to load review page.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      checkReview();
    }
  }, [courseId]);


  // ==========================================
  // SUBMIT REVIEW
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!rating) {
      setError('Please select a rating.');
      return;
    }

    if (!reviewText.trim()) {
      setError('Please write a review.');
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post(
        '/reviews/create.php',
        {
          course_id: Number(courseId),
          rating: Number(rating),
          review_text: reviewText.trim()
        }
      );

      if (!response.data?.status) {
        throw new Error(
          response.data?.message ||
          'Failed to submit review.'
        );
      }

      setSuccess(
        'Your review has been submitted successfully!'
      );

      // Show submitted review immediately
      setExistingReview({
        rating: Number(rating),
        review_text: reviewText.trim()
      });

      setRating(0);
      setReviewText('');

    } catch (err) {
      console.error('Submit Review Error:', err);

      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to submit review.'
      );
    } finally {
      setSubmitting(false);
    }
  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="container py-5">

        <div className="text-center">

          <div
            className="spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="text-muted mt-3 mb-0">
            Loading review page...
          </p>

        </div>

      </div>
    );
  }


  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="container py-4">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="mb-4">

        <button
          type="button"
          className="btn btn-outline-secondary mb-3"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <h2 className="mb-1">
          Course Review
        </h2>

        <p className="text-muted mb-0">
          {course?.title
            ? `Share your experience with ${course.title}.`
            : 'Share your experience with this course.'}
        </p>

      </div>


      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}


      {/* ==========================================
          SUCCESS
      ========================================== */}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}


      {/* ==========================================
          ALREADY REVIEWED
      ========================================== */}

      {existingReview ? (

        <div className="card shadow-sm border-0">

          <div className="card-body p-4 text-center">

            <h4 className="mb-2">
              You have already reviewed this course
            </h4>

            <p className="text-muted mb-4">
              You don't need to submit another review.
            </p>


            {/* ==========================================
                RATING
            ========================================== */}

            <div className="mb-3">

              <div
                className="d-flex justify-content-center gap-1"
                style={{
                  fontSize: '30px'
                }}
              >

                {[1, 2, 3, 4, 5].map((star) => (

                  <FaStar
                    key={star}
                    color={
                      star <= Number(existingReview.rating)
                        ? '#ffc107'
                        : '#d6d6d6'
                    }
                  />

                ))}

              </div>

              <small className="text-muted">
                {existingReview.rating} out of 5
              </small>

            </div>


            {/* ==========================================
                REVIEW TEXT
            ========================================== */}

            {existingReview.review_text && (

              <div className="bg-light rounded p-3 text-start">

                <h6 className="mb-2">
                  Your Review
                </h6>

                <p className="mb-0 text-muted">
                  {existingReview.review_text}
                </p>

              </div>

            )}

          </div>

        </div>

      ) : (

        /* ==========================================
           REVIEW FORM
        ========================================== */

        <div className="card shadow-sm border-0">

          <div className="card-body p-4">

            <form onSubmit={handleSubmit}>

              {/* ==========================================
                  RATING
              ========================================== */}

              <div className="mb-4">

                <label className="form-label fw-semibold">
                  Your Rating
                </label>

                <div className="d-flex gap-2">

                  {[1, 2, 3, 4, 5].map((star) => (

                    <button
                      key={star}
                      type="button"
                      className="btn p-0 border-0"
                      onClick={() => setRating(star)}
                      style={{
                        background: 'transparent',
                        lineHeight: 1
                      }}
                      aria-label={`${star} star`}
                    >

                      <FaStar
                        size={34}
                        color={
                          star <= rating
                            ? '#ffc107'
                            : '#d6d6d6'
                        }
                      />

                    </button>

                  ))}

                </div>

                <small className="text-muted">

                  {rating > 0
                    ? `${rating} out of 5`
                    : 'Select your rating'}

                </small>

              </div>


              {/* ==========================================
                  REVIEW TEXT
              ========================================== */}

              <div className="mb-4">

                <label
                  htmlFor="reviewText"
                  className="form-label fw-semibold"
                >
                  Your Review
                </label>

                <textarea
                  id="reviewText"
                  className="form-control"
                  rows="5"
                  placeholder="Write your experience about this course..."
                  value={reviewText}
                  onChange={(e) =>
                    setReviewText(e.target.value)
                  }
                  maxLength={1000}
                />

                <small className="text-muted">
                  {reviewText.length}/1000
                </small>

              </div>


              {/* ==========================================
                  SUBMIT
              ========================================== */}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >

                {submitting
                  ? 'Submitting...'
                  : 'Submit Review'}

              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Reviews;

