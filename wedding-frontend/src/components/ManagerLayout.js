import React from 'react';
import { Outlet } from 'react-router-dom';
import ManagerHeader from './ManagerHeader';

const ManagerLayout = () => {
  return (
    <>
      <ManagerHeader />
      <Outlet />
    </>
  );
};

export default ManagerLayout;
