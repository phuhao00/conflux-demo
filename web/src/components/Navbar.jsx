import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to="/" className="logo">
                    <div className="logo-icon">🌾</div>
                    <span>Conflux Farm</span>
                </Link>
                <ul className="nav-menu">
                    <li><Link to="/" className={isActive('/')}>首页</Link></li>
                    <li><Link to="/products" className={isActive('/products')}>产品种类</Link></li>
                    <li><Link to="/certificates" className={isActive('/certificates')}>数字证书</Link></li>
                    <li><Link to="/traceability" className={isActive('/traceability')}>溯源管理</Link></li>
                    <li><Link to="/operations" className={isActive('/operations')}>我的</Link></li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
