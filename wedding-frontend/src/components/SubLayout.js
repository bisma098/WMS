import React from 'react';
import Header2 from './Header2';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

function SubLayout() {
    return (
        <>
            <Header2 />
            <Outlet />
            <Footer />
        </>
    );
}

export default SubLayout;
