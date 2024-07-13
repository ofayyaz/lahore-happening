// components/User.js
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import gql from 'graphql-tag';
import { firestore } from '../../firebaseConfig'
import styles from './User.module.css';

const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($id: ID!, $role: String!) {
    updateUserRole(id: $id, role: $role) {
      id
      role
    }
  }
`;

const User = ({ user, onUpdate }) => {
  const [role, setRole] = useState(user.role);
  const [initialRole, setInitialRole] = useState(user.role);
  const [updateUserRole] = useMutation(UPDATE_USER_ROLE);

  const handleChange = async (e) => {
    const newRole = e.target.value;
    setRole(newRole);
  }

  const handleSave = async () => {
    try {
      await updateUserRole({ variables: { id: user.id, role } });
      const userDocRef = doc(firestore, 'users', user.id);
      
      //await updateDoc(userDocRef, { role });
      setInitialRole(role);
      onUpdate();
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  return (
    <div className={styles.tile}>
      <div className={styles.row1}>
        <p>{user.displayName} ({user.email})</p>
        <button
          className={role === initialRole ? styles.disabledButton : styles.activeButton}
          disabled={role === initialRole}
          onClick={handleSave}
        >
          Save
        </button>
      </div>
      <div className={styles.row2}>
        <label className={styles.label}>
          <input 
            type="radio" 
            value="Subscriber" 
            checked={role === 'Subscriber'} 
            onChange={handleChange} 
          /> 
          Subscriber
        </label>
        <label className={styles.label}>
          <input 
            type="radio" 
            value="Moderator" 
            checked={role === 'Moderator'} 
            onChange={handleChange} 
          /> 
          Moderator
        </label>
        <label className={styles.label}>
          <input 
            type="radio" 
            value="Admin" 
            checked={role === 'Admin'} 
            onChange={handleChange} 
          /> 
          Admin
        </label>
      </div>
    </div>
  );
};

export default User;
