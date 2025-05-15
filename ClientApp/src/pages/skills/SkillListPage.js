import React, { useState, useEffect } from 'react';
import { Container, Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';
import { useNotification } from '../../context/NotificationContext';
import { SkillService } from '../../services/api';

const SkillListPage = () => {
  const [skills, setSkills] = useState([]);
  const { withLoading } = useLoading();
  const { showError, showSuccess } = useNotification();

  // Fetch skills from the API
  const fetchSkills = async () => {
    try {
      const data = await withLoading(
        async () => await SkillService.getAll(),
        'Loading skills...'
      );
      
      setSkills(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error.message || 'Failed to load skills');
      console.error('Error fetching skills:', error);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle skill deletion
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await withLoading(
          async () => await SkillService.delete(id),
          'Deleting skill...'
        );
        
        showSuccess('Skill deleted successfully!');
        fetchSkills(); // Refresh the list
      } catch (error) {
        showError(error.message || 'Failed to delete skill');
        console.error('Error deleting skill:', error);
      }
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Skills</h1>
        <Button as={Link} to="/skills/new" variant="success">
          Add New Skill
        </Button>
      </div>
      
      {skills.length === 0 ? (
        <div className="text-center my-5">
          <p>No skills found.</p>
          <Button as={Link} to="/skills/new" variant="primary">
            Create a Skill
          </Button>
        </div>
      ) : (
        <Table responsive striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((skill) => (
              <tr key={skill.id}>
                <td>{skill.id}</td>
                <td>{skill.name}</td>
                <td>
                  <Button 
                    as={Link} 
                    to={`/skills/edit/${skill.id}`} 
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(skill.id, skill.name)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default SkillListPage; 