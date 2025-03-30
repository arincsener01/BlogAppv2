import React, { useState, useEffect } from 'react';
import { Container, Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';
import { useNotification } from '../../context/NotificationContext';
import { UserService } from '../../services/api';

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const { withLoading } = useLoading();
  const { showError, showSuccess } = useNotification();

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      const data = await withLoading(
        async () => await UserService.getAll(),
        'Loading users...'
      );
      
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error.message || 'Failed to load users');
      console.error('Error fetching users:', error);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle user deletion
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await withLoading(
          async () => await UserService.delete(id),
          'Deleting user...'
        );
        
        showSuccess('User deleted successfully!');
        fetchUsers(); // Refresh the list
      } catch (error) {
        showError(error.message || 'Failed to delete user');
        console.error('Error deleting user:', error);
      }
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Users</h1>
        <Button as={Link} to="/users/new" variant="success">
          Add New User
        </Button>
      </div>
      
      {users.length === 0 ? (
        <div className="text-center my-5">
          <p>No users found.</p>
          <Button as={Link} to="/users/new" variant="primary">
            Create a User
          </Button>
        </div>
      ) : (
        <Table responsive striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Username</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name} {user.surname}</td>
                <td>{user.userName}</td>
                <td>
                  <Button 
                    as={Link} 
                    to={`/users/edit/${user.id}`} 
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(user.id, `${user.name} ${user.surname}`)}
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

export default UserListPage; 