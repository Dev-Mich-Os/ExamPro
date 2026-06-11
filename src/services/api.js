import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// AUTH
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// COURSES
export const coursesAPI = {
  getAll: () => api.get('/courses'),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

// EXAMS
export const examsAPI = {
  getAll: (courseId) => api.get('/exams', { params: courseId ? { course_id: courseId } : {} }),
  create: (data) => api.post('/exams', data),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`),
  getForStudent: (id) => api.get(`/exams/student/${id}`),
};

// QUESTION BANK
export const questionBankAPI = {
  getByCourse: (courseId, params) => api.get(`/question-bank/course/${courseId}`, { params }),
  create: (courseId, data) => api.post(`/question-bank/course/${courseId}`, data),
  update: (id, data) => api.put(`/question-bank/${id}`, data),
  delete: (id) => api.delete(`/question-bank/${id}`),
  getAvailableForExam: (examId) => api.get(`/question-bank/exam/${examId}/available`),
  getExamQuestions: (examId) => api.get(`/question-bank/exam/${examId}/questions`),
  addToExam: (examId, questionId, data) => api.post(`/question-bank/exam/${examId}/question/${questionId}`, data || {}),
  removeFromExam: (examId, questionId) => api.delete(`/question-bank/exam/${examId}/question/${questionId}`),
};

// ATTEMPTS
export const attemptsAPI = {
  start: (examId) => api.post('/attempts/start', { exam_id: examId }),
  get: (attemptId) => api.get(`/attempts/${attemptId}`),
  saveAnswer: (attemptId, data) => api.post(`/attempts/${attemptId}/answer`, data),
  submit: (attemptId) => api.post(`/attempts/${attemptId}/submit`),
  autoSubmit: (attemptId) => api.post(`/attempts/${attemptId}/auto-submit`),
};

// REPORTS
export const reportsAPI = {
  dashboardStats: () => api.get('/reports/instructor/dashboard-stats'),
  instructorResults: (params) => api.get('/reports/instructor/results', { params }),
  attemptDetail: (attemptId) => api.get(`/reports/instructor/results/${attemptId}`),
  studentResults: () => api.get('/reports/student/results'),
  studentAttemptDetail: (attemptId) => api.get(`/reports/student/results/${attemptId}`),
};

export default api;
