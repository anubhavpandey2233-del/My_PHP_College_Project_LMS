-- =====================================================
-- PHP LMS PROJECT - SEED DATA
-- Password for all users: password123
-- =====================================================

USE php_lms_project;

-- Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'admin', 'System Administrator'),
(2, 'teacher', 'Course Instructor'),
(3, 'student', 'Learner')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Users (password = password123)
-- Hash generated with: password_hash("password123", PASSWORD_DEFAULT)
INSERT INTO users (role_id, name, email, password, status) VALUES
(1, 'Admin User', 'admin@lms.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active'),
(2, 'Rahul Sharma', 'teacher@lms.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active'),
(2, 'Priya Patel', 'teacher2@lms.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active'),
(3, 'Amit Kumar', 'student@lms.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active'),
(3, 'Sneha Verma', 'student2@lms.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Note: The hash above is a common demo hash. 
-- After import, run this PHP to generate real hash for "password123":
-- <?php echo password_hash("password123", PASSWORD_DEFAULT); ?>
-- Then UPDATE users SET password = 'new_hash' WHERE email LIKE '%@lms.com';

-- Categories
INSERT INTO categories (id, name, slug, description, status) VALUES
(1, 'Web Development', 'web-development', 'Learn modern web technologies', 'active'),
(2, 'Data Science', 'data-science', 'Python, Machine Learning, AI', 'active'),
(3, 'UI/UX Design', 'ui-ux-design', 'Design beautiful user interfaces', 'active'),
(4, 'Digital Marketing', 'digital-marketing', 'SEO, Social Media, Ads', 'active')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Subcategories
INSERT INTO subcategories (id, category_id, name, slug, status) VALUES
(1, 1, 'React.js', 'react-js', 'active'),
(2, 1, 'PHP & MySQL', 'php-mysql', 'active'),
(3, 1, 'Full Stack', 'full-stack', 'active'),
(4, 2, 'Python', 'python', 'active'),
(5, 2, 'Machine Learning', 'machine-learning', 'active'),
(6, 3, 'Figma', 'figma', 'active')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Sample Courses
INSERT INTO courses (id, teacher_id, category_id, subcategory_id, title, slug, short_description, description, price, discount_price, level, language, status, is_featured) VALUES
(1, 2, 1, 1, 'Complete React.js Course 2025', 'complete-react-js-course-2025', 'Master React from basics to advanced', 'This comprehensive React course covers everything from fundamentals to advanced patterns including Hooks, Context, Router, and more.', 2999.00, 1999.00, 'beginner', 'English', 'published', 1),
(2, 2, 1, 2, 'PHP & MySQL Mastery', 'php-mysql-mastery', 'Build real world PHP applications', 'Learn core PHP, PDO, MySQL, REST APIs and build complete backend systems.', 2499.00, NULL, 'intermediate', 'English', 'published', 1),
(3, 3, 2, 4, 'Python for Beginners', 'python-for-beginners', 'Start your Python journey today', 'Perfect starting point for absolute beginners. Learn Python syntax, data structures, and basic programming concepts.', 1999.00, 999.00, 'beginner', 'Hindi', 'published', 0)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Course Requirements
INSERT INTO course_requirements (course_id, requirement, sort_order) VALUES
(1, 'Basic knowledge of HTML & CSS', 1),
(1, 'Familiarity with JavaScript basics', 2),
(2, 'Basic programming knowledge', 1),
(2, 'Understanding of web fundamentals', 2);

-- Course Outcomes
INSERT INTO course_outcomes (course_id, outcome, sort_order) VALUES
(1, 'Build complete React applications', 1),
(1, 'Understand Hooks, Context API and React Router', 2),
(1, 'Deploy React apps to production', 3),
(2, 'Create secure PHP REST APIs', 1),
(2, 'Work with MySQL using PDO', 2);

-- Chapters
INSERT INTO chapters (id, course_id, title, sort_order) VALUES
(1, 1, 'Introduction to React', 1),
(2, 1, 'Components & Props', 2),
(3, 1, 'Hooks Deep Dive', 3),
(4, 2, 'PHP Basics', 1),
(5, 2, 'MySQL & PDO', 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Lessons
INSERT INTO lessons (id, chapter_id, title, content, video_url, video_duration, is_preview, sort_order) VALUES
(1, 1, 'What is React?', 'React is a JavaScript library for building user interfaces...', 'https://www.youtube.com/embed/dGcsHMXbSOA', 600, 1, 1),
(2, 1, 'Setting up the Environment', 'Install Node.js, Vite and create your first React app...', 'https://www.youtube.com/embed/dGcsHMXbSOA', 900, 1, 2),
(3, 2, 'Functional Components', 'Learn how to create and use functional components...', 'https://www.youtube.com/embed/dGcsHMXbSOA', 1200, 0, 1),
(4, 3, 'useState Hook', 'Master the useState hook for state management...', 'https://www.youtube.com/embed/dGcsHMXbSOA', 1500, 0, 1),
(5, 4, 'PHP Syntax Basics', 'Learn PHP variables, data types and operators...', 'https://www.youtube.com/embed/dGcsHMXbSOA', 800, 1, 1)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Sample Quiz
INSERT INTO quizzes (id, course_id, chapter_id, title, description, time_limit, passing_percentage, max_attempts, total_marks, status) VALUES
(1, 1, 1, 'React Basics Quiz', 'Test your React fundamentals knowledge', 15, 60.00, 3, 10.00, 'published')
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO quiz_questions (id, quiz_id, question, question_type, marks, sort_order) VALUES
(1, 1, 'What is JSX?', 'mcq', 2.00, 1),
(2, 1, 'React is a full framework.', 'true_false', 2.00, 2),
(3, 1, 'Which of the following are React Hooks?', 'multiple', 3.00, 3)
ON DUPLICATE KEY UPDATE question = VALUES(question);

INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(1, 'JavaScript XML', 1, 1),
(1, 'Java Syntax Extension', 0, 2),
(1, 'JSON XML', 0, 3),
(1, 'JavaScript Extension', 0, 4),
(2, 'True', 0, 1),
(2, 'False', 1, 2),
(3, 'useState', 1, 1),
(3, 'useEffect', 1, 2),
(3, 'useContext', 1, 3),
(3, 'useClass', 0, 4);
