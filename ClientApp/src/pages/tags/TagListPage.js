import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';
import { useNotification } from '../../context/NotificationContext';
import { TagService } from '../../services/api';

const TagListPage = () => {
  const [tags, setTags] = useState([]);
  const { withLoading } = useLoading();
  const { showError, showSuccess } = useNotification();

  // Fetch tags from the API
  const fetchTags = async () => {
    try {
      const data = await withLoading(
        async () => await TagService.getAll(),
        'Loading tags...'
      );
      
      setTags(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error.message || 'Failed to load tags');
      console.error('Error fetching tags:', error);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle tag deletion
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the tag "${name}"?`)) {
      try {
        await withLoading(
          async () => await TagService.delete(id),
          'Deleting tag...'
        );
        
        showSuccess('Tag deleted successfully!');
        fetchTags(); // Refresh the list
      } catch (error) {
        showError(error.message || 'Failed to delete tag');
        console.error('Error deleting tag:', error);
      }
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Tags</h1>
        <Button as={Link} to="/tags/new" variant="success">
          Add New Tag
        </Button>
      </div>
      
      {tags.length === 0 ? (
        <div className="text-center my-5">
          <p>No tags found.</p>
          <Button as={Link} to="/tags/new" variant="primary">
            Create a Tag
          </Button>
        </div>
      ) : (
        <Row>
          {tags.map((tag) => (
            <Col md={4} key={tag.id} className="mb-3">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <Badge bg="info" className="mb-2" style={{ fontSize: '1rem' }}>
                      {tag.name}
                    </Badge>
                    <div>
                      <Button 
                        as={Link} 
                        to={`/tags/edit/${tag.id}`} 
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(tag.id, tag.name)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  {tag.description && (
                    <Card.Text>{tag.description}</Card.Text>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default TagListPage; 