import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';

const CourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);

  const [form, setForm] = useState({
    title: '',
    short_description: '',
    description: '',
    category_id: '',
    subcategory_id: '',
    level: 'beginner',
    language: 'English',
    price: 0,
    discount_price: '',
    duration_hours: 0,
    status: 'draft',
    requirements: [''],
    outcomes: ['']
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (form.category_id) {
      fetchSubcategories(form.category_id);
    } else {
      setSubcategories([]);
      setForm(prev => ({
        ...prev,
        subcategory_id: ''
      }));
    }
  }, [form.category_id]);

  useEffect(() => {
    if (isEdit) {
      fetchCourse();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);

      const response = await api.get('/categories/list.php');

      if (response.data && response.data.status) {
        setCategories(response.data.data || []);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error(error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchSubcategories = async categoryId => {
    try {
      setLoadingSubcategories(true);
      setSubcategories([]);

      const response = await api.get(
        `/subcategories/list.php?category_id=${categoryId}`
      );

      if (response.data && response.data.status) {
        setSubcategories(response.data.data || []);
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      console.error(error);
      setSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  const fetchCourse = async () => {
    try {
      const response = await api.get(`/courses/get.php?id=${id}`);

      if (response.data && response.data.status) {
        const course = response.data.data;

        setForm({
          title: course.title || '',
          short_description: course.short_description || '',
          description: course.description || '',
          category_id: course.category_id ? String(course.category_id) : '',
          subcategory_id: course.subcategory_id
            ? String(course.subcategory_id)
            : '',
          level: course.level || 'beginner',
          language: course.language || 'English',
          price: course.price ?? 0,
          discount_price: course.discount_price ?? '',
          duration_hours: course.duration_hours ?? 0,
          status: course.status || 'draft',
          requirements:
            Array.isArray(course.requirements) &&
            course.requirements.length > 0
              ? course.requirements.map(item =>
                  typeof item === 'string'
                    ? item
                    : item.requirement || ''
                )
              : [''],
          outcomes:
            Array.isArray(course.outcomes) &&
            course.outcomes.length > 0
              ? course.outcomes.map(item =>
                  typeof item === 'string'
                    ? item
                    : item.outcome || ''
                )
              : ['']
        });

        if (course.category_id) {
          await fetchSubcategories(course.category_id);
        }
      }
    } catch (error) {
      console.error(error);
      alert('Unable to load course');
    }
  };

  const handleChange = event => {
    const { name, value } = event.target;

    if (name === 'category_id') {
      setForm(prev => ({
        ...prev,
        category_id: value,
        subcategory_id: ''
      }));
      return;
    }

    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setForm(prev => {
      const updated = [...prev[field]];
      updated[index] = value;

      return {
        ...prev,
        [field]: updated
      };
    });
  };

  const addArrayItem = field => {
    setForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setForm(prev => {
      const updated = prev[field].filter((_, i) => i !== index);

      return {
        ...prev,
        [field]: updated.length > 0 ? updated : ['']
      };
    });
  };

 const handleSubmit = async (event) => {
  event.preventDefault();

  if (!form.title.trim()) {
    alert('Course title is required');
    return;
  }

  if (!form.category_id) {
    alert('Please select a category');
    return;
  }

  setLoading(true);

  try {
    const formData = new FormData();

    formData.append('title', form.title.trim());
    formData.append('short_description', form.short_description || '');
    formData.append('description', form.description || '');
    formData.append('category_id', String(form.category_id));
    formData.append('subcategory_id', form.subcategory_id ? String(form.subcategory_id) : '');
    formData.append('level', form.level || 'beginner');
    formData.append('language', form.language || 'English');
    formData.append('price', String(form.price || 0));
    formData.append(
      'discount_price',
      form.discount_price !== '' && form.discount_price !== null
        ? String(form.discount_price)
        : ''
    );
    formData.append('duration_hours', String(form.duration_hours || 0));
    formData.append('status', form.status || 'draft');

    const requirements = form.requirements
      .filter((item) => item && item.trim() !== '');

    const outcomes = form.outcomes
      .filter((item) => item && item.trim() !== '');

    formData.append('requirements', JSON.stringify(requirements));
    formData.append('outcomes', JSON.stringify(outcomes));

    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }

    if (isEdit) {
      formData.append('id', String(id));
    }

    const url = isEdit
      ? '/courses/update.php'
      : '/courses/create.php';

    const response = await api.post(url, formData);

    if (response.data?.status) {
      alert(
        isEdit
          ? 'Course updated successfully'
          : 'Course created successfully'
      );

      navigate('/teacher/courses');
    } else {
      alert(response.data?.message || 'Unable to save course');
    }

  } catch (error) {
    console.log('STATUS:', error.response?.status);
    console.log('BACKEND RESPONSE:', error.response?.data);
    console.log('ERROR:', error);

    const message =
      error.response?.data?.message ||
      'Unable to save course';

    alert(message);

  } finally {
    setLoading(false);
  }
};
  return (
    <DashboardLayout>
      <div className="container-fluid">
        <h2 className="mb-4">
          {isEdit ? 'Edit Course' : 'Create Course'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h5 className="mb-3">Course Information</h5>

                  <div className="mb-3">
                    <label className="form-label">
                      Title *
                    </label>

                    <input
                      type="text"
                      name="title"
                      className="form-control"
                      value={form.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Short Description
                    </label>

                    <input
                      type="text"
                      name="short_description"
                      className="form-control"
                      value={form.short_description}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Full Description
                    </label>

                    <textarea
                      name="description"
                      className="form-control"
                      rows="6"
                      value={form.description}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h5 className="mb-3">
                    Requirements
                  </h5>

                  {form.requirements.map((item, index) => (
                    <div
                      className="input-group mb-2"
                      key={index}
                    >
                      <input
                        type="text"
                        className="form-control"
                        value={item}
                        onChange={event =>
                          handleArrayChange(
                            'requirements',
                            index,
                            event.target.value
                          )
                        }
                      />

                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() =>
                          removeArrayItem(
                            'requirements',
                            index
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() =>
                      addArrayItem('requirements')
                    }
                  >
                    + Add Requirement
                  </button>
                </div>
              </div>

              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h5 className="mb-3">
                    Learning Outcomes
                  </h5>

                  {form.outcomes.map((item, index) => (
                    <div
                      className="input-group mb-2"
                      key={index}
                    >
                      <input
                        type="text"
                        className="form-control"
                        value={item}
                        onChange={event =>
                          handleArrayChange(
                            'outcomes',
                            index,
                            event.target.value
                          )
                        }
                      />

                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() =>
                          removeArrayItem(
                            'outcomes',
                            index
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() =>
                      addArrayItem('outcomes')
                    }
                  >
                    + Add Outcome
                  </button>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">
                      Category *
                    </label>

                    <select
                      name="category_id"
                      className="form-select"
                      value={form.category_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        {loadingCategories
                          ? 'Loading categories...'
                          : 'Select Category'}
                      </option>

                      {categories.map(category => (
                        <option
                          key={category.id}
                          value={String(category.id)}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Subcategory
                    </label>

                    <select
                      name="subcategory_id"
                      className="form-select"
                      value={form.subcategory_id}
                      onChange={handleChange}
                      disabled={
                        !form.category_id ||
                        loadingSubcategories
                      }
                    >
                      <option value="">
                        {!form.category_id
                          ? 'Select Category First'
                          : loadingSubcategories
                          ? 'Loading subcategories...'
                          : subcategories.length === 0
                          ? 'No Subcategory Available'
                          : 'Select Subcategory'}
                      </option>

                      {subcategories.map(subcategory => (
                        <option
                          key={subcategory.id}
                          value={String(subcategory.id)}
                        >
                          {subcategory.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Level
                    </label>

                    <select
                      name="level"
                      className="form-select"
                      value={form.level}
                      onChange={handleChange}
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

                  <div className="mb-3">
                    <label className="form-label">
                      Language
                    </label>

                    <input
                      type="text"
                      name="language"
                      className="form-control"
                      value={form.language}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Price (₹)
                    </label>

                    <input
                      type="number"
                      name="price"
                      className="form-control"
                      min="0"
                      value={form.price}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Discount Price (₹)
                    </label>

                    <input
                      type="number"
                      name="discount_price"
                      className="form-control"
                      min="0"
                      value={form.discount_price}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Duration (Hours)
                    </label>

                    <input
                      type="number"
                      name="duration_hours"
                      className="form-control"
                      min="0"
                      value={form.duration_hours}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Status
                    </label>

                    <select
                      name="status"
                      className="form-select"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="draft">
                        Draft
                      </option>

                      <option value="published">
                        Published
                      </option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Thumbnail
                    </label>

                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={event =>
                        setThumbnail(
                          event.target.files?.[0] || null
                        )
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading
                      ? 'Saving...'
                      : isEdit
                      ? 'Update Course'
                      : 'Create Course'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CourseForm;