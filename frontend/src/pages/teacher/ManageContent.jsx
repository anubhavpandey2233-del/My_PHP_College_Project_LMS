import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loading from '../../components/common/Loading';
import { FaRegTrashCan } from "react-icons/fa6";
import { BsPencilFill } from "react-icons/bs";

const ManageContent = () => {
  const { id: courseId } = useParams();

  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newChapterTitle, setNewChapterTitle] = useState('');

  const [editingChapterId, setEditingChapterId] = useState(null);
  const [editingChapterTitle, setEditingChapterTitle] = useState('');

  const [showLessonForm, setShowLessonForm] = useState(null);
  const [editingLessonId, setEditingLessonId] = useState(null);

  const [lessonForm, setLessonForm] = useState({
    title: '',
    video_url: '',
    is_preview: false
  });

  const fetchChapters = async () => {
    try {
      const response = await api.get(
        `/chapters/list.php?course_id=${courseId}`
      );

      if (response.data.status) {
        setChapters(response.data.data || []);
      } else {
        setChapters([]);
      }
    } catch (error) {
      console.error(error);
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [courseId]);

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim()) {
      alert('Chapter title is required');
      return;
    }

    try {
      const response = await api.post('/chapters/create.php', {
        course_id: courseId,
        title: newChapterTitle.trim()
      });

      if (response.data.status) {
        setNewChapterTitle('');
        await fetchChapters();
      } else {
        alert(response.data.message || 'Failed to add chapter');
      }
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
        'Failed to add chapter'
      );
    }
  };

  const startEditChapter = (chapter) => {
    setEditingChapterId(chapter.id);
    setEditingChapterTitle(chapter.title || '');
  };

  const cancelEditChapter = () => {
    setEditingChapterId(null);
    setEditingChapterTitle('');
  };

  const handleUpdateChapter = async (chapterId) => {
    if (!editingChapterTitle.trim()) {
      alert('Chapter title is required');
      return;
    }

    try {
      const response = await api.post('/chapters/update.php', {
        id: chapterId,
        title: editingChapterTitle.trim()
      });

      if (response.data.status) {
        setEditingChapterId(null);
        setEditingChapterTitle('');
        await fetchChapters();
      } else {
        alert(
          response.data.message ||
          'Failed to update chapter'
        );
      }
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
        'Failed to update chapter'
      );
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Delete this chapter and all its lessons?')) {
      return;
    }

    try {
      const response = await api.post(
        '/chapters/delete.php',
        {
          id: chapterId
        }
      );

      if (response.data.status) {
        await fetchChapters();
      } else {
        alert(
          response.data.message ||
          'Failed to delete chapter'
        );
      }
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
        'Failed to delete chapter'
      );
    }
  };

  const openAddLesson = (chapterId) => {
    setShowLessonForm(chapterId);
    setEditingLessonId(null);

    setLessonForm({
      title: '',
      video_url: '',
      is_preview: false
    });
  };

  const handleAddLesson = async (chapterId) => {
    if (!lessonForm.title.trim()) {
      alert('Lesson title is required');
      return;
    }

    try {
      const response = await api.post(
        '/lessons/create.php',
        {
          chapter_id: chapterId,
          title: lessonForm.title.trim(),
          video_url: lessonForm.video_url.trim(),
          is_preview: lessonForm.is_preview ? 1 : 0
        }
      );

      if (response.data.status) {
        setShowLessonForm(null);

        setLessonForm({
          title: '',
          video_url: '',
          is_preview: false
        });

        await fetchChapters();
      } else {
        alert(
          response.data.message ||
          'Failed to add lesson'
        );
      }
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
        'Failed to add lesson'
      );
    }
  };

  const startEditLesson = (lesson) => {
    setEditingLessonId(lesson.id);
    setShowLessonForm(null);

    setLessonForm({
      title: lesson.title || '',
      video_url: lesson.video_url || '',
      is_preview: Number(lesson.is_preview) === 1
    });
  };

  const cancelEditLesson = () => {
    setEditingLessonId(null);

    setLessonForm({
      title: '',
      video_url: '',
      is_preview: false
    });
  };

  const handleUpdateLesson = async (lessonId) => {
    if (!lessonForm.title.trim()) {
      alert('Lesson title is required');
      return;
    }

    try {
      const response = await api.post(
        '/lessons/update.php',
        {
          id: lessonId,
          title: lessonForm.title.trim(),
          video_url: lessonForm.video_url.trim(),
          is_preview: lessonForm.is_preview ? 1 : 0
        }
      );

      if (response.data.status) {
        setEditingLessonId(null);

        setLessonForm({
          title: '',
          video_url: '',
          is_preview: false
        });

        await fetchChapters();
      } else {
        alert(
          response.data.message ||
          'Failed to update lesson'
        );
      }
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
        'Failed to update lesson'
      );
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) {
      return;
    }

    try {
      const response = await api.post(
        '/lessons/delete.php',
        {
          id: lessonId
        }
      );

      if (response.data.status) {
        await fetchChapters();
      } else {
        alert(
          response.data.message ||
          'Failed to delete lesson'
        );
      }
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
        'Failed to delete lesson'
      );
    }
  };

  const cancelLessonForm = () => {
    setShowLessonForm(null);
    setEditingLessonId(null);

    setLessonForm({
      title: '',
      video_url: '',
      is_preview: false
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Course Content</h2>

        <Link
          to="/teacher/courses"
          className="btn btn-outline-secondary"
        >
          ← Back to Courses
        </Link>
      </div>

      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="New chapter title..."
              value={newChapterTitle}
              onChange={(e) =>
                setNewChapterTitle(e.target.value)
              }
            />

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddChapter}
            >
              Add Chapter
            </button>
          </div>
        </div>
      </div>

      {chapters.map((chapter, index) => (
        <div
          className="card mb-3 shadow-sm"
          key={chapter.id}
        >
          <div className="card-header d-flex justify-content-between align-items-center">
            {editingChapterId === chapter.id ? (
              <div className="d-flex gap-2 w-100">
                <input
                  type="text"
                  className="form-control"
                  value={editingChapterTitle}
                  onChange={(e) =>
                    setEditingChapterTitle(e.target.value)
                  }
                />

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() =>
                    handleUpdateChapter(chapter.id)
                  }
                >
                  ✓
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelEditChapter}
                >
                  ×
                </button>
              </div>
            ) : (
              <>
                <strong>
                  #{index + 1} {chapter.title}
                </strong>

                <div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() =>
                      openAddLesson(chapter.id)
                    }
                  >
                    + Lesson
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-warning me-2"
                    onClick={() =>
                      startEditChapter(chapter)
                    }
                  >
                    <BsPencilFill/>
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() =>
                      handleDeleteChapter(chapter.id)
                    }
                  >
                    <FaRegTrashCan/>
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="card-body">
            {chapter.lessons?.length === 0 && (
              <p className="text-muted small">
                No lessons yet
              </p>
            )}

            <ul className="list-group list-group-flush">
              {chapter.lessons?.map((lesson, lessonIndex) => (
                <li
                  key={lesson.id}
                  className="list-group-item"
                >
                  {editingLessonId === lesson.id ? (
                    <div className="border rounded p-3 bg-light">
                      <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Lesson title"
                        value={lessonForm.title}
                        onChange={(e) =>
                          setLessonForm({
                            ...lessonForm,
                            title: e.target.value
                          })
                        }
                      />

                      <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="YouTube Video URL"
                        value={lessonForm.video_url}
                        onChange={(e) =>
                          setLessonForm({
                            ...lessonForm,
                            video_url: e.target.value
                          })
                        }
                      />

                      <div className="form-check mb-3">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={lessonForm.is_preview}
                          onChange={(e) =>
                            setLessonForm({
                              ...lessonForm,
                              is_preview: e.target.checked
                            })
                          }
                        />

                        <label className="form-check-label">
                          Free Preview
                        </label>
                      </div>

                      <button
                        type="button"
                        className="btn btn-success btn-sm me-2"
                        onClick={() =>
                          handleUpdateLesson(lesson.id)
                        }
                      >
                        Update
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={cancelEditLesson}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-between align-items-center">
                      <span>
                        {lessonIndex + 1}. {lesson.title}

                        {Number(lesson.is_preview) === 1 && (
                          <span className="badge bg-success ms-2">
                            Preview
                          </span>
                        )}
                      </span>

                      <div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-warning me-2"
                          onClick={() =>
                            startEditLesson(lesson)
                          }
                        >
                          <BsPencilFill/>
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            handleDeleteLesson(lesson.id)
                          }
                        >
                          <FaRegTrashCan/>
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {showLessonForm === chapter.id && (
              <div className="mt-3 border rounded p-3 bg-light">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Lesson title"
                  value={lessonForm.title}
                  onChange={(e) =>
                    setLessonForm({
                      ...lessonForm,
                      title: e.target.value
                    })
                  }
                />

                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="YouTube Video URL"
                  value={lessonForm.video_url}
                  onChange={(e) =>
                    setLessonForm({
                      ...lessonForm,
                      video_url: e.target.value
                    })
                  }
                />

                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={lessonForm.is_preview}
                    onChange={(e) =>
                      setLessonForm({
                        ...lessonForm,
                        is_preview: e.target.checked
                      })
                    }
                  />

                  <label className="form-check-label">
                    Free Preview
                  </label>
                </div>

                <button
                  type="button"
                  className="btn btn-success btn-sm me-2"
                  onClick={() =>
                    handleAddLesson(chapter.id)
                  }
                >
                  Save Lesson
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={cancelLessonForm}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {chapters.length === 0 && (
        <div className="alert alert-info">
          No chapters yet. Add your first chapter above.
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageContent;