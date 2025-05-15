import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">Blog App</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            {user?.isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/blogs">Blogs</Nav.Link>
                {user.roles?.includes('Admin') && (
                  <>
                    <Nav.Link as={Link} to="/users">Users</Nav.Link>
                    <Nav.Link as={Link} to="/tags">Tags</Nav.Link>
                    <Nav.Link as={Link} to="/skills">Skills</Nav.Link>
                  </>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {user?.isAuthenticated ? (
              <div className="d-flex align-items-center">
                <span className="text-light me-3">
                  Welcome, {user.userName}
                </span>
                <Button 
                  variant="outline-light" 
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar; 