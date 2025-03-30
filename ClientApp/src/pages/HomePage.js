import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useLoading } from '../context/LoadingContext';
import { useNotification } from '../context/NotificationContext';
import { BlogService } from '../services/api';
import Spinner from '../components/common/Spinner';

const HomePage = () => {
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useNotification();

  useEffect(() => {
    const fetchLatestBlogs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Set a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          setIsLoading(false);
          setError('Request timed out. Please check if the API is running and refresh the page.');
        }, 10000); // 10 seconds timeout
        
        // Make the API call
        const data = await BlogService.getAll();
        
        // Clear the timeout if the request succeeded
        clearTimeout(timeoutId);
        
        // Take only the latest 3 blogs
        setLatestBlogs(Array.isArray(data) ? data.slice(0, 3) : []);
        setIsLoading(false);
      } catch (error) {
        // Show error notification
        setIsLoading(false);
        setError(error.message || 'Failed to load latest blogs');
        showError(error.message || 'Failed to load latest blogs');
        console.error('Error fetching latest blogs:', error);
      }
    };

    fetchLatestBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Truncate text to a certain length for previews
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section">
        <Container>
          <h1 className="hero-title">Welcome to the Blog App</h1>
          <p className="hero-subtitle">
            Dive deep into the various blogs created by our users. 
          </p>
          <p className="hero-subtitle">
            Creators: Arınç Doğan Şener, Ozan Kürkçü, Simay Ardıç 
          </p>
          <Button as={Link} to="/blogs/new" variant="light" size="lg" className="mt-3">
            Create a Blog Post
          </Button>
        </Container>
      </div>

      {/* Latest Blogs Section */}
      <Container className="py-5">
        <h2 className="mb-4">Latest Blog Posts</h2>
        
        {isLoading ? (
          <Spinner message="Loading latest blogs..." />
        ) : error ? (
          <Alert variant="danger">
            <Alert.Heading>Error Loading Blogs</Alert.Heading>
            <p>{error}</p>
            <hr />
            <div className="d-flex justify-content-end">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline-danger"
              >
                Refresh Page
              </Button>
            </div>
          </Alert>
        ) : latestBlogs.length === 0 ? (
          <div className="text-center my-5">
            <p>No blog posts found. Be the first to create a blog post!</p>
            <Button as={Link} to="/blogs/new" variant="primary">
              Create a Blog Post
            </Button>
          </div>
        ) : (
          <Row>
            {latestBlogs.map((blog) => (
              <Col md={4} key={blog.id} className="mb-4">
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title>{blog.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      By {blog.userFullName} on {new Date(blog.publishDate).toLocaleDateString()}
                    </Card.Subtitle>
                    <Card.Text>{truncateText(blog.content)}</Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <Button as={Link} to={`/blogs/${blog.id}`} variant="outline-primary">
                      Read More
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}
        
        <div className="text-center mt-4">
          <Button as={Link} to="/blogs" variant="outline-secondary" size="lg">
            View All Blog Posts
          </Button>
        </div>
      </Container>
      
      {/* Features Section */}
      <Container className="py-5 bg-light">
        <Row className="text-center">
          <Col md={4} className="mb-4">
            <h3>Create</h3>
            <p>Share your knowledge and ideas by creating blog posts on various topics.</p>
          </Col>
          <Col md={4} className="mb-4">
            <h3>Connect</h3>
            <p>Connect with other users who share similar interests and learn from them.</p>
          </Col>
          <Col md={4} className="mb-4">
            <h3>Discover</h3>
            <p>Discover new topics and expand your knowledge through our diverse blogs.</p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HomePage; 