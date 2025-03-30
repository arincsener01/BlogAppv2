import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';
import { useNotification } from '../../context/NotificationContext';
import { BlogService } from '../../services/api';
import Spinner from '../../components/common/Spinner';

const BlogListPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { withLoading } = useLoading();
  const { showError, showSuccess } = useNotification();

  // Fetch blogs from the API
  const fetchBlogs = async () => {
    try {
      const params = {};
      if (searchTerm) {
        params.title = searchTerm;
      }
      
      const data = await withLoading(
        async () => await BlogService.getAll(params),
        'Loading blogs...'
      );
      
      setBlogs(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error.message || 'Failed to load blogs');
      console.error('Error fetching blogs:', error);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchBlogs();
  }, []);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    fetchBlogs();
  };

  // Handle blog deletion
  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await withLoading(
          async () => await BlogService.delete(id),
          'Deleting blog...'
        );
        
        showSuccess('Blog deleted successfully!');
        fetchBlogs(); // Refresh the list
      } catch (error) {
        showError(error.message || 'Failed to delete blog');
        console.error('Error deleting blog:', error);
      }
    }
  };

  // Truncate text for previews
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container>
      <h1 className="mb-4">Blog Posts</h1>
      
      {/* Search Form */}
      <Form onSubmit={handleSearch} className="mb-4">
        <Row>
          <Col md={8}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" variant="primary">
                Search
              </Button>
            </InputGroup>
          </Col>
          <Col md={4} className="d-flex justify-content-end">
            <Button as={Link} to="/blogs/new" variant="success">
              Create New Blog
            </Button>
          </Col>
        </Row>
      </Form>
      
      {/* Blog List */}
      {blogs.length === 0 ? (
        <div className="text-center my-5">
          <p>No blog posts found.</p>
          <Button as={Link} to="/blogs/new" variant="primary">
            Create a Blog Post
          </Button>
        </div>
      ) : (
        <Row>
          {blogs.map((blog) => (
            <Col md={6} key={blog.id} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>{blog.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    By {blog.userFullName} on {formatDate(blog.publishDate)}
                  </Card.Subtitle>
                  <Card.Text>{truncateText(blog.content)}</Card.Text>
                  {blog.tagNames && (
                    <div className="blog-tags">
                      {blog.tagNames.split(', ').map((tag, index) => (
                        <span key={index} className="blog-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between">
                  <Button as={Link} to={`/blogs/${blog.id}`} variant="outline-primary">
                    Read More
                  </Button>
                  <div>
                    <Button 
                      as={Link} 
                      to={`/blogs/edit/${blog.id}`} 
                      variant="outline-secondary"
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline-danger"
                      onClick={() => handleDelete(blog.id, blog.title)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default BlogListPage; 