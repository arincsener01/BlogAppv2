import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';
import { useNotification } from '../../context/NotificationContext';
import { BlogService } from '../../services/api';
import Spinner from '../../components/common/Spinner';

const BlogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const { withLoading } = useLoading();
  const { showError, showSuccess } = useNotification();

  // Fetch blog details on component mount
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const data = await withLoading(
          async () => await BlogService.getById(id),
          'Loading blog details...'
        );
        
        setBlog(data);
      } catch (error) {
        showError(error.message || 'Failed to load blog details');
        console.error('Error fetching blog details:', error);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id, withLoading, showError]);

  // Handle blog deletion
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${blog.title}"?`)) {
      try {
        await withLoading(
          async () => await BlogService.delete(id),
          'Deleting blog...'
        );
        
        showSuccess('Blog deleted successfully!');
        navigate('/blogs'); // Redirect to blogs list
      } catch (error) {
        showError(error.message || 'Failed to delete blog');
        console.error('Error deleting blog:', error);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!blog) {
    return (
      <Container className="py-5 text-center">
        <p>Blog not found or has been deleted.</p>
        <Button as={Link} to="/blogs" variant="primary">
          Back to Blogs
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="blog-detail-header">
        <h1 className="blog-detail-title">{blog.title}</h1>
        <div className="blog-detail-meta">
          <span>By {blog.userFullName}</span>
          <span className="mx-2">•</span>
          <span>{formatDate(blog.publishDate)}</span>
          {blog.rating && (
            <>
              <span className="mx-2">•</span>
              <span>Rating: {blog.rating}/5</span>
            </>
          )}
        </div>
        {blog.tagNames && (
          <div className="blog-tags">
            {blog.tagNames.split(', ').map((tag, index) => (
              <span key={index} className="blog-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="blog-detail-content mb-5">
        {blog.content && blog.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <hr />

      <div className="d-flex justify-content-between mb-5">
        <Button as={Link} to="/blogs" variant="outline-secondary">
          Back to Blogs
        </Button>
        <div>
          <Button 
            as={Link} 
            to={`/blogs/edit/${blog.id}`} 
            variant="outline-primary"
            className="me-2"
          >
            Edit
          </Button>
          <Button 
            variant="outline-danger"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      {blog.user && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">About the Author</h5>
          </Card.Header>
          <Card.Body>
            <h6>{blog.userFullName}</h6>
            <p>Username: {blog.user.userName}</p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default BlogDetailPage; 