import React from 'react';

const NavBar = () => {
    return (
        <nav style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.075)',
            padding: '5px 15px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            {/* Left side: Logo and Company Name */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                    src="/images/logo1.png"
                    alt="Logo"
                    style={{ height: '40px', marginRight: '12px', filter: 'drop-shadow(3px 3px 2px rgba(0, 0, 0, 0.3))' }}
                />
                <span className='text-white' style={{ fontSize: '1.03rem', fontWeight: 700, textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>
                    FATHOM SCIENCE
                </span>
            </div>
        </nav>
    );
};

export default NavBar;