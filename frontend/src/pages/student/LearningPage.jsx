import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loading from '../../components/common/Loading';

const LearningPage = () => {
  const { courseId } = useParams();
  const [data, setData] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const fetchData = async () => {
    try {
      const res = await api.get(`/student/learning.php?course_id=${courseId}`);
      if (res.data.status) {
        setData(res.data.data);
        setProgress(res.data.data.enrollment?.progress || 0);

        const lastId = res.data.data.enrollment?.last_lesson_id;
        let found = null;
        for (const ch of res.data.data.chapters || []) {
          for (const l of ch.lessons || []) {
            if (lastId && l.id == lastId) found = l;
            if (!found) found = l;
          }
        }
        if (found) setCurrentLesson(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [courseId]);

  const markComplete = async () => {
    if (!currentLesson) return;
    try {
      const res = await api.post('/student/mark-complete.php', { lesson_id: currentLesson.id });
      if (res.data.status) {
        setProgress(res.data.data.progress);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;
  if (!data) return <DashboardLayout><div className="alert alert-danger">Course not found or not enrolled</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">{data.course?.title}</h5>
              <div className="progress mt-2" style={{ height: '8px' }}>
                <div className="progress-bar bg-warning" style={{ width: `${progress}%` }}></div>
              </div>
              <small>{progress}% Complete</small>
            </div>
            <div className="card-body p-0" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {(data.chapters || []).map(ch => (
                <div key={ch.id} className="border-bottom">
                  <div className="p-3 fw-bold bg-light">{ch.title}</div>
                  <ul className="list-group list-group-flush">
                    {(ch.lessons || []).map(l => (
                      <li
                        key={l.id}
                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${currentLesson?.id === l.id ? 'active' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setCurrentLesson(l)}
                      >
                        <span>
                          {l.is_completed ? '✓ ' : ''}{l.title}
                          {l.is_preview ? <span className="badge bg-success ms-1">Free</span> : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          {currentLesson ? (
            <div className="card shadow-sm">
              <div className="card-body">
                <h4>{currentLesson.title}</h4>
                {currentLesson.video_url ? (
                  <div className="ratio ratio-16x9 mb-3">
                    <iframe
                      src={currentLesson.video_url.includes('embed') ? currentLesson.video_url : currentLesson.video_url.replace('watch?v=', 'embed/')}
                      title={currentLesson.title}
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="alert alert-secondary">No video available for this lesson</div>
                )}

                <div className="mb-3">
                  {currentLesson.content?.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>

                <div className="d-flex gap-2">
                  {!currentLesson.is_completed && (
                    <button className="btn btn-success" onClick={markComplete}>Mark as Complete</button>
                  )}
                  {currentLesson.is_completed && (
                    <span className="badge bg-success p-2">Completed ✓</span>
                  )}
                </div>

                {progress >= 100 && (
                  <div className="alert alert-success mt-4">
                    <h5>🎉 Course Completed!</h5>
                    <p>Congratulations! You can now view your certificate.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="alert alert-info">Select a lesson to start learning</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LearningPage;
