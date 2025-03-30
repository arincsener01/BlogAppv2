import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';
import { useNotification } from '../../context/NotificationContext';
import { UserService } from '../../services/api';
import ErrorMessage from '../../components/common/ErrorMessage';

const UserFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const { withLoading } = useLoading();
  const { showError, showSuccess } = useNotification();
  
  // Form state
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    surname: '',
    userName: '',
    email: '',
    password: '',
    isActive: true,
    registrationDate: new Date().toISOString(),
    roleId: 1,
    skillIds: []
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  // API Error
  const [apiError, setApiError] = useState(null);

  // Fetch user data if in edit mode
  useEffect(() => {
    const fetchUser = async () => {
      if (isEditMode) {
        try {
          setApiError(null);
          // Due to a backend bug, we need to fetch all users and filter manually by ID
          const allUsers = await withLoading(
            async () => await UserService.getAll(),
            'Loading user data...'
          );
          
          // Find the user that matches our ID
          const userData = allUsers.find(user => user.id === parseInt(id));
          
          if (userData) {
            setFormData({
              id: parseInt(id), // Use the ID from URL params to ensure it's correct
              name: userData.name || '',
              surname: userData.surname || '',
              userName: userData.userName || '',
              email: userData.email || '',
              password: '', // Don't show password in edit mode
              isActive: userData.isActive !== undefined ? userData.isActive : true,
              registrationDate: userData.registrationDate || new Date().toISOString(),
              roleId: userData.roleId || 1,
              skillIds: userData.skillIds || []
            });
          } else {
            showError('User not found');
            setApiError('Could not find user with ID ' + id);
            // Don't navigate away, let the user see the error
          }
        } catch (error) {
          setApiError(error.message || 'Failed to load user data');
          showError(error.message || 'Failed to load user data');
          console.error('Error fetching user:', error);
        }
      }
    };
    
    fetchUser();
  }, [id, isEditMode, withLoading, showError, navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear the error for this field when the user changes it
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.surname.trim()) {
      newErrors.surname = 'Surname is required';
    }
    
    if (!formData.userName.trim()) {
      newErrors.userName = 'Username is required';
    } else if (formData.userName.length < 4) {
      newErrors.userName = 'Username must be at least 4 characters';
    }
    
    if (!isEditMode && !formData.password) {
      newErrors.password = 'Password is required for new users';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.roleId) {
      newErrors.roleId = 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }
    
    try {
      // Format data for backend
      const submissionData = {
        id: isEditMode ? parseInt(id) : 0,
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        userName: formData.userName.trim(),
        password: formData.password, // Required for creation
        isActive: formData.isActive,
        registrationDate: formData.registrationDate,
        roleId: parseInt(formData.roleId),
        skillIds: formData.skillIds || []
      };
      
      // Log the submission data for debugging
      console.log('Submitting user with data:', submissionData);
      
      if (isEditMode) {
        // Update existing user
        const response = await withLoading(
          async () => await UserService.update(submissionData),
          'Updating user...'
        );
        
        if (response && response.success) {
          showSuccess('User updated successfully!');
          navigate('/users');
        } else {
          throw new Error(response.message || 'Failed to update user');
        }
      } else {
        // Create new user
        const response = await withLoading(
          async () => await UserService.create(submissionData),
          'Creating user...'
        );
        
        if (response && response.success) {
          showSuccess('User created successfully!');
          navigate('/users');
        } else {
          throw new Error(response.message || 'Failed to create user');
        }
      }
    } catch (error) {
      showError(error.message || `Failed to ${isEditMode ? 'update' : 'create'} user`);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} user:`, error);
    }
  };

  return (
    <Container className="py-4">
      <div className="form-section">
        <h1 className="form-title">{isEditMode ? 'Edit User' : 'Create New User'}</h1>
        
        {apiError && (
          <Alert variant="danger" className="mb-3">
            <Alert.Heading>Error Loading User Data</Alert.Heading>
            <p>{apiError}</p>
            <Button onClick={() => navigate('/users')} variant="outline-danger">
              Return to User List
            </Button>
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  isInvalid={!!errors.name}
                />
                <ErrorMessage message={errors.name} />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  isInvalid={!!errors.surname}
                />
                <ErrorMessage message={errors.surname} />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  isInvalid={!!errors.userName}
                />
                <ErrorMessage message={errors.userName} />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                />
                <ErrorMessage message={errors.email} />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Password {isEditMode && '(leave empty to keep current)'}</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                  required={!isEditMode}
                />
                <ErrorMessage message={errors.password} />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  isInvalid={!!errors.roleId}
                >
                  <option value="1">Administrator</option>
                  <option value="2">User</option>
                  <option value="3">Guest</option>
                </Form.Select>
                <ErrorMessage message={errors.roleId} />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Active"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-between mt-4">
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/users')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {isEditMode ? 'Update' : 'Create'} User
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default UserFormPage; 