import React from 'react';
import Header3 from './Header3';
import Footer from './Footer'
import { Outlet } from 'react-router-dom';

function SubLayout() {
    return (
        <>
            <Header3 />
            <Outlet />
            <Footer />
        </>
    );
}

export default SubLayout;
