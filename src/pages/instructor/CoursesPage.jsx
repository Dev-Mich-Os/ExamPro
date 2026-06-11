import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../../services/api';
import {
  Layout, PageHeader, Card, Button, Alert, Spinner, Modal, ConfirmModal,
  FormField, Input, Textarea, Table, Badge
} from '../../components/shared';

const CourseForm = ({ initial, onSave, onCancel, loading }) => {
  const [form, setForm] = useState(initial || { name: '', description: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Course name is required');
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert message={error} onClose={() => setError('')} />}
      <FormField label="Course Name" required>
        <Input
          value={form.name} placeholder="e.g., Introduction to Computer Science"
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
      </FormField>
      <FormField label="Description">
        <Textarea
          value={form.description || ''} placeholder="Brief description of the course..."
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
      </FormField>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
        <Button variant="secondary" onClick={onCancel} type="button">Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Course'}</Button>
      </div>
    </form>
  );
};

export const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    coursesAPI.getAll()
      .then(res => setCourses(res.data.data))
      .catch(() => setError('Failed to load courses'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await coursesAPI.update(editing.id, form);
        setSuccess('Course updated successfully');
      } else {
        await coursesAPI.create(form);
        setSuccess('Course created successfully');
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await coursesAPI.delete(deleting.id);
      setSuccess('Course deleted');
      setDeleting(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const rows = courses.map(c => [
    <strong>{c.name}</strong>,
    c.description || <span style={{ color: '#9ca3af' }}>—</span>,
    <Badge color="blue">{c.exam_count || 0} exams</Badge>,
    <Badge color="purple">{c.question_count || 0} questions</Badge>,
    <div style={{ display: 'flex', gap: 8 }}>
      <Button variant="secondary" style={{ padding: '6px 14px', fontSize: 13 }}
        onClick={() => { setEditing(c); setShowForm(true); }}>Edit</Button>
      <Button variant="danger" style={{ padding: '6px 14px', fontSize: 13 }}
        onClick={() => setDeleting(c)}>Delete</Button>
    </div>
  ]);

  return (
    <Layout>
      <PageHeader
        title="Course Management"
        subtitle="Manage your courses and their settings"
        actions={<Button onClick={() => { setEditing(null); setShowForm(true); }}>+ New Course</Button>}
      />
      {error && <Alert message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <Card>
        {loading ? <Spinner /> : (
          <Table
            headers={['Name', 'Description', 'Exams', 'Questions', 'Actions']}
            rows={rows}
            emptyMessage="No courses yet. Create your first course!"
          />
        )}
      </Card>

      <Modal
        isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? 'Edit Course' : 'New Course'}
      >
        <CourseForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          loading={saving}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleting?.name}"? This will also delete all exams and questions in this course.`}
      />
    </Layout>
  );
};
