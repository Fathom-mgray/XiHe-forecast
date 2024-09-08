import React from 'react';

const NavBar = () => {
    return (
        <nav style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '7px 15px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            {/* Left side: Logo and Company Name */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                    src="/images/logo1.png"
                    alt="Logo"
                    style={{ height: '35px', width: '35px', marginRight: '12px' }}
                />
                <span className='text-white' style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    FATHOM SCIENCE
                </span>
            </div>
        </nav>
    );
};

export default NavBar;