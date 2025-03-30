import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto">
      <Container>
        <Row>
          <Col md={6}>
            <h5>Blog App</h5>
            <p className="text-muted">
              A simple blog application built with React and .NET Core.
            </p>
          </Col>
          <Col md={3}>
            <h5>Links</h5>
            <ul className="list-unstyled">
              <li><a href="/">Home</a></li>
              <li><a href="/blogs">Blogs</a></li>
              <li><a href="/users">Users</a></li>
              <li><a href="/tags">Tags</a></li>
            </ul>
          </Col>
          <Col md={3}>
            <h5>Resources</h5>
            <ul className="list-unstyled">
              <li><a href="https://reactjs.org" target="_blank" rel="noopener noreferrer">React</a></li>
              <li><a href="https://dotnet.microsoft.com" target="_blank" rel="noopener noreferrer">.NET</a></li>
              <li><a href="https://react-bootstrap.github.io" target="_blank" rel="noopener noreferrer">React Bootstrap</a></li>
            </ul>
          </Col>
        </Row>
        <hr />
        <div className="text-center py-3">
          <p className="mb-0">© {currentYear} CTIS Blog App.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer; 