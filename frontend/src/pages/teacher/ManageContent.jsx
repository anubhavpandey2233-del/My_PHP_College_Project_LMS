import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loading from '../../components/common/Loading';

const ManageContent = () => {
  const { id: courseId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [showLessonForm, setShowLessonForm] = useState(null);
  const [lessonForm, setLessonForm] = useState({ title: '', video_url: '', is_preview: false });

  const fetchChapters = async () => {
    try {
      const res = await api.get(`/chapters/list.php?course_id=${courseId}`);
      if (res.data.status) setChapters(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChapters(); }, [courseId]);

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim()) return;
    await api.post('/chapters/create.php', { course_id: courseId, title: newChapterTitle });
    setNewChapterTitle('');
    fetchChapters();
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Delete this chapter and all its lessons?')) return;
    await api.post('/chapters/delete.php', { id: chapterId });
    fetchChapters();
  };

  const handleAddLesson = async (chapterId) => {
    if (!lessonForm.title.trim()) return;
    await api.post('/lessons/create.php', {
      chapter_id: chapterId,
      title: lessonForm.title,
      video_url: lessonForm.video_url,
      is_preview: lessonForm.is_preview
    });
    setShowLessonForm(null);
    setLessonForm({ title: '', video_url: '', is_preview: false });
    fetchChapters();
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    await api.post('/lessons/delete.php', { id: lessonId });
    fetchChapters();
  };

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Course Content</h2>
        <Link to="/teacher/courses" className="btn btn-outline-secondary">← Back to Courses</Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="New chapter title..."
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleAddChapter}>Add Chapter</button>
          </div>
        </div>
      </div>

      {chapters.map((chapter, index) => (
        <div className="card mb-3" key={chapter.id}>
          <div className="card-header d-flex justify-content-between align-items-center">
            <strong>#{index + 1} {chapter.title}</strong>
            <div>
              <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setShowLessonForm(chapter.id)}>
                + Lesson
              </button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteChapter(chapter.id)}>
                Delete
              </button>
            </div>
          </div>
          <div className="card-body">
            {chapter.lessons?.length === 0 && <p className="text-muted small">No lessons yet</p>}
            <ul className="list-group list-group-flush">
              {chapter.lessons?.map((lesson, lIndex) => (
                <li key={lesson.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>
                    {lIndex + 1}. {lesson.title}
                    {lesson.is_preview ? <span className="badge bg-success ms-2">Preview</span> : null}
                  </span>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteLesson(lesson.id)}>×</button>
                </li>
              ))}
            </ul>

            {showLessonForm === chapter.id && (
              <div className="mt-3 p-3 border rounded bg-light">
                <input
                  className="form-control mb-2"
                  placeholder="Lesson title"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                />
                <input
                  className="form-control mb-2"
                  placeholder="Video URL (YouTube embed or direct)"
                  value={lessonForm.video_url}
                  onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                />
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={lessonForm.is_preview}
                    onChange={(e) => setLessonForm({ ...lessonForm, is_preview: e.target.checked })}
                  />
                  <label className="form-check-label">Free Preview</label>
                </div>
                <button className="btn btn-sm btn-success me-2" onClick={() => handleAddLesson(chapter.id)}>Save Lesson</button>
                <button className="btn btn-sm btn-secondary" onClick={() => setShowLessonForm(null)}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      ))}

      {chapters.length === 0 && (
        <div className="alert alert-info">No chapters yet. Add your first chapter above.</div>
      )}
    </DashboardLayout>
  );
};

export default ManageContent;
