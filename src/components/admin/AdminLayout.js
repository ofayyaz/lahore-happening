import React from 'react';
import AdminHeader from './AdminHeader';

const AdminLayout = ({ children }) => {
  return (
    <div>
      <AdminHeader />
      <main>{children}</main>
    </div>
  );
};

export default AdminLayout;
