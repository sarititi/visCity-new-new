import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext.jsx';
import { registerUser } from '../../API/usersAPI';
import '../../styles/auth.css';

export default function Register() {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    try {
      const data = await registerUser({ userName, email, password });

      if (data?.error) {
        setError(data.error);
        return;
      }

      login({ ...data.user, token: data.token });
      navigate('/places');
    } catch {
      setError('שגיאה בהרשמה. אנא נסו שוב.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🗺️</div>
          <h1 className="auth-title">צרי חשבון חדש</h1>
          <p className="auth-subtitle">הצטרפי ותתחילי לגלות מקומות חדשים</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="userName">שם משתמש</label>
            <input
              id="userName"
              name="userName"
              type="text"
              placeholder="השם שלך"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">אימייל</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">סיסמה</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="לפחות 6 תווים"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword">אימות סיסמה</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="הזיני שוב את הסיסמה"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn">
            הרשמי
          </button>
        </form>

        <p className="auth-switch">
          כבר יש לך חשבון?{' '}
          <Link to="/login">התחברי כאן</Link>
        </p>
      </div>
    </div>
  );
}