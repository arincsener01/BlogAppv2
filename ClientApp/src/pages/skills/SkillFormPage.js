import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';
import { useNotification } from '../../context/NotificationContext';
import { SkillService } from '../../services/api';
import ErrorMessage from '../../components/common/ErrorMessage';

const SkillFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const { withLoading } = useLoading();
  const { showError, showSuccess } = useNotification();
  
  // Form state
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    userIds: []
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  // Load skill data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      loadSkill();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Load skill data from API
  const loadSkill = async () => {
    try {
      const data = await withLoading(
        async () => await SkillService.getById(id),
        'Loading skill...'
      );
      
      if (data) {
        setFormData({
          id: data.id,
          name: data.name,
          userIds: data.userIds || []
        });
      } else {
        showError('Skill not found');
        navigate('/skills');
      }
    } catch (error) {
      showError(error.message || 'Failed to load skill');
      console.error('Error loading skill:', error);
      navigate('/skills');
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const submitData = {
        ...formData,
        name: formData.name.trim()
      };
      
      await withLoading(
        async () => {
          if (isEditMode) {
            await SkillService.update(submitData);
          } else {
            await SkillService.create(submitData);
          }
        },
        isEditMode ? 'Updating skill...' : 'Creating skill...'
      );
      
      showSuccess(`Skill ${isEditMode ? 'updated' : 'created'} successfully!`);
      navigate('/skills');
    } catch (error) {
      setApiError(error.message || `Failed to ${isEditMode ? 'update' : 'create'} skill`);
      console.error('Error submitting skill:', error);
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{isEditMode ? 'Edit Skill' : 'New Skill'}</h1>
      </div>
      
      {apiError && (
        <Alert variant="danger" className="mb-4">
          {apiError}
        </Alert>
      )}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            isInvalid={!!errors.name}
            maxLength={50}
            required
          />
          <ErrorMessage message={errors.name} />
        </Form.Group>
        
        <div className="d-flex gap-2">
          <Button type="submit" variant="primary">
            {isEditMode ? 'Update' : 'Create'} Skill
          </Button>
          <Button 
            type="button" 
            variant="outline-secondary"
            onClick={() => navigate('/skills')}
          >
            Cancel
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default SkillFormPage; 