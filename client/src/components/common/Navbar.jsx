import { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import '../../styles/navbar.css';
import logoImg from '../../assets/logo.png';

export default function Navbar() {
  const { user, logout } = useContext(UserContext);

  const [openMenu, setOpenMenu] = useState(false);
  const [openUser, setOpenUser] = useState(false);

  const menuRef = useRef();
  const userRef = useRef();

  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }

      if (userRef.current && !userRef.current.contains(e.target)) {
        setOpenUser(false);
      }
    }

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="top-nav" dir="rtl">
      <div className="nav-right">

        <Link to="/home" className="logo-wrap">
          <img
            src={logoImg}
            alt="לוגו"
            className="nav-logo"
            draggable="false"
          />
        </Link>

      </div>

      <div className="nav-center">
        <Link to="/home" className="nav-link">
          דף הבית
        </Link>

        <Link to="/places" className="nav-link">
          טיולים
        </Link>

        <Link to="/gallery" className="nav-link">
          גלריה
        </Link>

        {(user &&
          (user.role === 'admin' || user.username === 'admin1')) && (
          <Link to="/admin/users" className="nav-link">
            ניהול משתמשים
          </Link>
        )}

        {user && (
          <Link to="/favorites" className="nav-link">
            המועדפים שלי
          </Link>
        )}
      </div>

      <div className="nav-left">
        <div ref={menuRef} className="mobile-menu">

          <button
            className="hamburger"
            onClick={() => setOpenMenu((s) => !s)}
            aria-label="תפריט"
          >
            ☰
          </button>

          {openMenu && (
            <div className="mobile-menu-pop">
              <Link to="/home" onClick={() => setOpenMenu(false)}>
                דף הבית
              </Link>

              <Link to="/places" onClick={() => setOpenMenu(false)}>
                טיולים
              </Link>

              <Link to="/gallery" onClick={() => setOpenMenu(false)}>
                גלריה
              </Link>
            </div>
          )}
        </div>

        <div ref={userRef} className="user-area">
          {!user ? (
            <Link to="/login" className="auth-link">
              התחברות/הרשמה
            </Link>
          ) : (
            <div className="user-dropdown">
              <button
                className="user-btn"
                onClick={() => setOpenUser((s) => !s)}
              >
                שלום, {user.username}
              </button>

              {openUser && (
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">
                    צפיה בפרופיל
                  </Link>

                  <Link to="/profile/edit" className="dropdown-item">
                    עדכון פרופיל
                  </Link>

                  <Link to="/favorites" className="dropdown-item">
                    מסלולים מותאמים אישית
                  </Link>

                  {(user.role === 'admin' ||
                    user.username === 'admin1') && (
                    <Link
                      to="/admin/users"
                      className="dropdown-item"
                    >
                      מנהל משתמשים
                    </Link>
                  )}

                  <button
                    className="dropdown-item danger"
                    onClick={handleLogout}
                  >
                    התנתקות
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}