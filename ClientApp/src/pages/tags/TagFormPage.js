import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';
import { useNotification } from '../../context/NotificationContext';
import { TagService } from '../../services/api';
import ErrorMessage from '../../components/common/ErrorMessage';

const TagFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const { withLoading } = useLoading();
  const { showError, showSuccess } = useNotification();
  
  // Form state
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    description: '',
    blogIds: []
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  // API Error
  const [apiError, setApiError] = useState(null);

  // Fetch tag data if in edit mode
  useEffect(() => {
    const fetchTag = async () => {
      if (isEditMode) {
        try {
          setApiError(null);
          
          // Try to get tag by ID first
          let data = null;
          try {
            data = await withLoading(
              async () => await TagService.getById(id),
              'Loading tag data...'
            );
          } catch (idError) {
            console.error('Error fetching tag by ID:', idError);
            
            // If that fails, try getting all tags and filtering
            const allTags = await withLoading(
              async () => await TagService.getAll(),
              'Loading all tags...'
            );
            
            // Find the specific tag
            data = allTags.find(tag => tag.id === parseInt(id));
          }
          
          if (data) {
            setFormData({
              id: parseInt(id), // Use ID from URL to ensure it's correct
              name: data.name || '',
              description: data.description || '',
              blogIds: data.blogIds || []
            });
          } else {
            showError('Tag not found');
            setApiError('Could not find tag with ID ' + id);
          }
        } catch (error) {
          setApiError(error.message || 'Failed to load tag data');
          showError(error.message || 'Failed to load tag data');
          console.error('Error fetching tag:', error);
        }
      }
    };
    
    fetchTag();
  }, [id, isEditMode, withLoading, showError, navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
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
      newErrors.name = 'Tag name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Delete and then create tag (workaround for backend bug)
  const recreateTag = async (originalId, tagData) => {
    console.log(`Attempting to recreate tag ${originalId} with name ${tagData.name}`);
    
    // Create a new tag
    try {
      // First check if we need to delete the old tag
      const shouldDelete = await checkIfTagExists(originalId);
      
      if (shouldDelete) {
        try {
          // Try to delete the existing tag
          await TagService.delete(originalId);
          console.log(`Successfully deleted tag ${originalId}`);
        } catch (deleteError) {
          console.error(`Error deleting tag ${originalId}:`, deleteError);
          // Continue even if delete fails - we'll try to create a new one
        }
      }
      
      // Create a new tag with the same data
      const createData = {
        id: 0, // Force new creation
        name: tagData.name.trim(),
        blogIds: tagData.blogIds || []
      };
      
      const createResponse = await withLoading(
        async () => await TagService.create(createData),
        'Creating tag as workaround...'
      );
      
      if (createResponse && createResponse.success) {
        return createResponse;
      } else {
        throw new Error(createResponse?.message || 'Failed to create tag');
      }
    } catch (error) {
      console.error('Recreate tag failed:', error);
      throw error;
    }
  };
  
  // Helper function to check if a tag exists
  const checkIfTagExists = async (tagId) => {
    try {
      const allTags = await TagService.getAll();
      return allTags.some(tag => tag.id === parseInt(tagId));
    } catch (error) {
      console.error('Error checking if tag exists:', error);
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }
    
    try {
      // Format the submission data according to backend requirements
      const submissionData = {
        id: isEditMode ? parseInt(id) : 0,
        name: formData.name.trim(),
        blogIds: formData.blogIds || [] // Include empty array if no blogs selected
      };
      
      // Log the submission data for debugging
      console.log('Submitting tag with data:', submissionData);
      
      if (isEditMode) {
        // Update existing tag
        try {
          // Check if tag exists before trying to update
          const tagExists = await checkIfTagExists(id);
          
          if (!tagExists) {
            console.log(`Tag with ID ${id} does not exist in the backend. Creating instead of updating.`);
            const createResponse = await recreateTag(parseInt(id), submissionData);
            showSuccess('Tag created successfully as a workaround!');
            navigate('/tags');
            return;
          }
          
          // Tag exists, try to update
          const response = await withLoading(
            async () => await TagService.update(submissionData),
            'Updating tag...'
          );
          
          if (response && response.success) {
            showSuccess('Tag updated successfully!');
            navigate('/tags');
          } else {
            throw new Error(response?.message || 'Failed to update tag');
          }
        } catch (updateError) {
          console.error('Tag update failed. Trying alternative approach:', updateError);
          
          // If the error message contains "Tag not found" or similar, we know it's the specific backend bug
          const errorMsg = updateError.message?.toLowerCase() || '';
          const isTagNotFoundError = errorMsg.includes('not found') || 
                                   errorMsg.includes('does not exist') || 
                                   errorMsg.includes('occured during tagput');
          
          if (isTagNotFoundError) {
            try {
              // Use our dedicated function to recreate the tag
              const createResponse = await recreateTag(parseInt(id), submissionData);
              showSuccess('Tag created successfully as a workaround!');
              navigate('/tags');
              return;
            } catch (createError) {
              console.error('Create fallback failed:', createError);
              throw new Error('Both update and create attempts failed: ' + createError.message);
            }
          } else {
            // It's some other error
            throw updateError;
          }
        }
      } else {
        // Create new tag
        const response = await withLoading(
          async () => await TagService.create(submissionData),
          'Creating tag...'
        );
        
        if (response && response.success) {
          showSuccess('Tag created successfully!');
          navigate('/tags');
        } else {
          throw new Error(response?.message || 'Failed to create tag');
        }
      }
    } catch (error) {
      showError(error.message || `Failed to ${isEditMode ? 'update' : 'create'} tag`);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} tag:`, error);
    }
  };

  return (
    <Container className="py-4">
      <div className="form-section">
        <h1 className="form-title">{isEditMode ? 'Edit Tag' : 'Create New Tag'}</h1>
        
        {apiError && (
          <Alert variant="danger" className="mb-3">
            <Alert.Heading>Error Loading Tag Data</Alert.Heading>
            <p>{apiError}</p>
            <Button onClick={() => navigate('/tags')} variant="outline-danger">
              Return to Tag List
            </Button>
          </Alert>
        )}
        
        {isEditMode && (
          <Alert variant="info" className="mb-3">
            <p><strong>Note:</strong> Due to a backend issue, editing a tag may create a new tag with the same name instead of updating the existing one.</p>
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Tag Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              isInvalid={!!errors.name}
            />
            <ErrorMessage message={errors.name} />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Description (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>
          
          <div className="d-flex justify-content-between mt-4">
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/tags')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {isEditMode ? 'Update' : 'Create'} Tag
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default TagFormPage; 