import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';

const Navbar = () => {
  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">Blog App</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="navbar-nav" />
        <BootstrapNavbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/blogs">
              Blogs
            </Nav.Link>
            <Nav.Link as={NavLink} to="/users">
              Users
            </Nav.Link>
            <Nav.Link as={NavLink} to="/tags">
              Tags
            </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link as={NavLink} to="/blogs/new" className="btn btn-primary text-white">
              Create New Blog
            </Nav.Link>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar; 