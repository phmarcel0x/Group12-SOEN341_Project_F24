import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../images/4.svg';


const Header = () => {
    const navigate = useNavigate()

    const logoutClick = () => {
        navigate('/login')
    }

  return (
    <div className="header">
        <div>
            <Link id="header-logo">
            <img src={logo} alt="Logo" className="logo-image" />
            </Link>
        </div>

        <div className="links--wrapper">
            <>
                <Link to="/" className="header--link">Home</Link>
                <Link to="/profile" className="header--link">Profile</Link>

                <button onClick={logoutClick} className="btn">Logout</button>
            </>
            {/* <>

                <Link className="btn" to="/login">Login</Link>
            </> */}
            
        </div>
    </div>

  )
}

export default Header
