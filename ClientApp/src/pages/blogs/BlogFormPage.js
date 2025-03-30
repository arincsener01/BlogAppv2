import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';
import { useNotification } from '../../context/NotificationContext';
import { BlogService, UserService, TagService } from '../../services/api';
import ErrorMessage from '../../components/common/ErrorMessage';

const BlogFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const { withLoading } = useLoading();
  const { showError, showSuccess } = useNotification();
  
  // Form state
  const [formData, setFormData] = useState({
    id: 0,
    title: '',
    content: '',
    rating: '',
    publishDate: new Date().toISOString().split('T')[0],
    userId: '',
    tagIds: []
  });
  
  // Users and tags for dropdowns
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);
  
  // Loading and error states
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [isLoadingBlog, setIsLoadingBlog] = useState(false);
  const [userError, setUserError] = useState(null);
  const [tagError, setTagError] = useState(null);
  const [blogError, setBlogError] = useState(null);
  
  // Validation errors
  const [errors, setErrors] = useState({});

  // Function to fetch users with error handling
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      setUserError(null);
      
      // Set a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 10000)
      );
      
      const userPromise = UserService.getAll();
      
      // Race between the fetch and timeout
      const usersData = await Promise.race([userPromise, timeoutPromise]);
      
      console.log('Fetched users data:', usersData);
      
      if (Array.isArray(usersData) && usersData.length > 0) {
        // Fix the user ID issue - the backend might return all IDs as 0
        // We'll assign incrementing tempIds for the dropdown selection
        const modifiedUsers = usersData.map((user, index) => ({
          ...user,
          // Keep the original ID but also generate a temporary ID for the dropdown that's unique
          id: user.id, // Keep the original ID
          tempId: index + 1, // Unique ID for selection purposes
          // Create a descriptive display name
          displayName: `${user.name} ${user.surname} (${user.userName})`
        }));
        
        console.log('Modified users for dropdown:', modifiedUsers);
        setUsers(modifiedUsers);
      } else {
        console.warn('No users returned from API or invalid data structure');
        setUsers([]);
      }
      
      setIsLoadingUsers(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUserError(error.message || 'Failed to load users');
      setIsLoadingUsers(false);
    }
  };
  
  // Function to fetch tags with error handling
  const fetchTags = async () => {
    try {
      setIsLoadingTags(true);
      setTagError(null);
      
      // Set a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 10000)
      );
      
      const tagPromise = TagService.getAll();
      
      // Race between the fetch and timeout
      const tagsData = await Promise.race([tagPromise, timeoutPromise]);
      
      setTags(Array.isArray(tagsData) ? tagsData : []);
      setIsLoadingTags(false);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setTagError(error.message || 'Failed to load tags');
      setIsLoadingTags(false);
    }
  };
  
  // Function to fetch blog data with error handling
  const fetchBlogData = async () => {
    if (!isEditMode) return;
    
    try {
      setIsLoadingBlog(true);
      setBlogError(null);
      
      // Set a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 10000)
      );
      
      const blogPromise = BlogService.getById(id);
      
      // Race between the fetch and timeout
      const blogData = await Promise.race([blogPromise, timeoutPromise]);
      
      console.log('Fetched blog data:', blogData);
      
      if (blogData) {
        // First, make sure we have users loaded
        if (users.length === 0) {
          await fetchUsers();
        }
        
        // Now find the matching user by userName (since IDs might all be 0)
        const matchingUser = users.find(u => 
          u.userName === blogData.user?.userName || 
          u.id === blogData.userId
        );
        
        console.log('Matching user for blog:', matchingUser);
        
        setFormData({
          id: blogData.id,
          title: blogData.title || '',
          content: blogData.content || '',
          rating: blogData.rating || '',
          publishDate: blogData.publishDate 
            ? new Date(blogData.publishDate).toISOString().split('T')[0] 
            : new Date().toISOString().split('T')[0],
          // Set the tempId of the matching user, or empty if not found
          userId: matchingUser?.tempId || '',
          // Ensure tagIds is always an array
          tagIds: Array.isArray(blogData.tagIds) ? blogData.tagIds : []
        });
      } else {
        showError('Blog not found');
        navigate('/blogs');
      }
      
      setIsLoadingBlog(false);
    } catch (error) {
      console.error('Error fetching blog data:', error);
      setBlogError(error.message || 'Failed to load blog data');
      setIsLoadingBlog(false);
    }
  };

  // Fetch blog data, users, and tags on component mount
  useEffect(() => {
    fetchUsers();
    fetchTags();
    fetchBlogData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For userId, ensure it's stored as a number
    if (name === 'userId') {
      setFormData({
        ...formData,
        [name]: value ? parseInt(value, 10) : ''
      });
      
      console.log(`Selected user ID: ${value}`);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear the error for this field when the user changes it
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Handle tag selection (multi-select)
  const handleTagChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions, 
      option => parseInt(option.value, 10)
    );
    
    // Log to verify we're getting numbers
    console.log('Selected tag IDs:', selectedOptions);
    
    setFormData({
      ...formData,
      tagIds: selectedOptions
    });
    
    // Clear the error for tags when the user changes them
    if (errors.tagIds) {
      setErrors({
        ...errors,
        tagIds: ''
      });
    }
  };

  // Validate form data
  const validateForm = () => {
    console.log('Running validation, current form data:', formData);
    const newErrors = {};
    
    if (!formData.title || !formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    }
    
    if (!formData.content || !formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.trim().length < 20) {
      newErrors.content = 'Content must be at least 20 characters long';
    }
    
    // Make sure userId is present and valid
    if (!formData.userId) {
      newErrors.userId = 'Author is required';
      console.log('Author validation failed: userId is empty or null');
    } else {
      // Verify userId matches a valid user in our list
      const userExists = users.some(user => user.tempId === parseInt(formData.userId, 10));
      if (!userExists) {
        newErrors.userId = 'Please select a valid author';
        console.log('Author validation failed: No matching user found for userId:', formData.userId);
      }
    }
    
    if (formData.rating && (parseFloat(formData.rating) < 0 || parseFloat(formData.rating) > 5)) {
      newErrors.rating = 'Rating must be between 0 and 5';
    }
    
    if (!formData.publishDate) {
      newErrors.publishDate = 'Publish date is required';
    }
    
    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Log form data before validation for debugging
    console.log('Form data before validation:', formData);
    
    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }
    
    try {
      // Find the actual user using the tempId to get the real user data
      const selectedUser = users.find(user => user.tempId === parseInt(formData.userId, 10));
      
      if (!selectedUser) {
        showError('Selected user not found. Please select a valid user.');
        return;
      }
      
      console.log('Selected user for blog:', selectedUser);
      
      // Convert rating to number if provided
      const submissionData = {
        ...formData,
        // Format rating as a number or null if empty
        rating: formData.rating !== '' && formData.rating !== null ? parseFloat(formData.rating) : null,
        id: isEditMode ? parseInt(id) : 0,
        // Use the user's ID - all users have ID 0 in the backend for now
        userId: selectedUser.id || 0,
        // Ensure tagIds is an array of integers (empty array if undefined)
        tagIds: formData.tagIds?.map(id => parseInt(id, 10)) || [],
        // Make sure publishDate is properly formatted
        publishDate: new Date(formData.publishDate).toISOString()
      };
      
      // Debug log the submission data
      console.log('Submitting blog with data:', submissionData);
      
      if (isEditMode) {
        // Update existing blog
        const response = await withLoading(
          async () => await BlogService.update(submissionData),
          'Updating blog...'
        );
        
        console.log('Update response:', response);
        
        if (response && response.success) {
          showSuccess('Blog updated successfully!');
          navigate(`/blogs/${id}`);
        } else {
          console.error('Blog update failed:', response);
          throw new Error(response?.message || 'Failed to update blog');
        }
      } else {
        // Create new blog 
        // For blog creation, we need to ensure we're sending the exact format the backend expects
        const createData = {
          // Only include fields expected by the BlogCreateRequest model
          title: submissionData.title,
          content: submissionData.content,
          rating: submissionData.rating,
          publishDate: submissionData.publishDate,
          userId: submissionData.userId, // All users have ID 0 in backend currently
          id: 0
        };
        
        console.log('Creating blog with clean data:', createData);
        
        const response = await withLoading(
          async () => await BlogService.create(createData),
          'Creating blog...'
        );
        
        console.log('Create response:', response);
        
        if (response && response.success) {
          showSuccess('Blog created successfully!');
          navigate('/blogs');
        } else {
          // Show detailed error message for debugging purposes
          console.error('Blog creation error details:', response);
          let errorMessage = response?.message || 'Failed to create blog';
          if (errorMessage.includes("|")) {
            // This is likely a validation error with multiple messages
            const validationErrors = errorMessage.split("|");
            errorMessage = `Validation errors: ${validationErrors.join(", ")}`;
          }
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      showError(error.message || `Failed to ${isEditMode ? 'update' : 'create'} blog`);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} blog:`, error);
    }
  };

  return (
    <Container className="py-4">
      <div className="form-section">
        <h1 className="form-title">{isEditMode ? 'Edit Blog' : 'Create New Blog'}</h1>
        
        {/* Error alerts for data loading */}
        {userError && (
          <Alert variant="warning" className="mb-3">
            <Alert.Heading>Error Loading Users</Alert.Heading>
            <p>{userError}</p>
            <Button onClick={fetchUsers} variant="outline-warning" size="sm">
              Retry Loading Users
            </Button>
          </Alert>
        )}
        
        {tagError && (
          <Alert variant="warning" className="mb-3">
            <Alert.Heading>Error Loading Tags</Alert.Heading>
            <p>{tagError}</p>
            <Button onClick={fetchTags} variant="outline-warning" size="sm">
              Retry Loading Tags
            </Button>
          </Alert>
        )}
        
        {blogError && (
          <Alert variant="warning" className="mb-3">
            <Alert.Heading>Error Loading Blog Data</Alert.Heading>
            <p>{blogError}</p>
            <Button onClick={fetchBlogData} variant="outline-warning" size="sm">
              Retry Loading Blog Data
            </Button>
          </Alert>
        )}
        
        {/* Loading indicators */}
        {isLoadingUsers && <p><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading users...</p>}
        {isLoadingTags && <p><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading tags...</p>}
        {isLoadingBlog && <p><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading blog data...</p>}
        
        {/* Form validation errors display at the top */}
        {Object.keys(errors).length > 0 && (
          <Alert variant="danger" className="mb-3">
            <Alert.Heading>Please fix the following errors:</Alert.Heading>
            <ul>
              {Object.keys(errors).map((field) => (
                <li key={field}><strong>{field}:</strong> {errors[field]}</li>
              ))}
            </ul>
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              isInvalid={!!errors.title}
            />
            <ErrorMessage message={errors.title} />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={10}
              name="content"
              value={formData.content}
              onChange={handleChange}
              isInvalid={!!errors.content}
            />
            <ErrorMessage message={errors.content} />
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Author</Form.Label>
                <Form.Select
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  isInvalid={!!errors.userId}
                >
                  <option value="">Select an author</option>
                  {users.map(user => (
                    <option key={user.tempId} value={user.tempId}>
                      {user.displayName}
                    </option>
                  ))}
                </Form.Select>
                <ErrorMessage message={errors.userId} />
                {users.length === 0 && !isLoadingUsers && (
                  <Alert variant="warning" className="mt-2 p-2">
                    <small>No users available. Please add users first.</small>
                  </Alert>
                )}
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Publish Date</Form.Label>
                <Form.Control
                  type="date"
                  name="publishDate"
                  value={formData.publishDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Rating (1-5)</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  isInvalid={!!errors.rating}
                />
                <ErrorMessage message={errors.rating} />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tags</Form.Label>
                <Form.Select
                  multiple
                  name="tagIds"
                  value={formData.tagIds}
                  onChange={handleTagChange}
                  style={{ height: '100px' }}
                >
                  {tags.map(tag => (
                    <option key={tag.id} value={tag.id}>{tag.name}</option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Hold Ctrl (or Cmd) to select multiple tags.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-between mt-4">
            <Button
              variant="outline-secondary"
              onClick={() => navigate(isEditMode ? `/blogs/${id}` : '/blogs')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {isEditMode ? 'Update' : 'Create'} Blog
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default BlogFormPage; 