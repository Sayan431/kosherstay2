import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    const name = localStorage.getItem('name');
    const isApproved = localStorage.getItem('isApproved') === 'true';
    if (token) {
      setUser({ token, role, userId, name, isApproved });
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('userId', data.user_id);
    localStorage.setItem('name', data.name);
    localStorage.setItem('isApproved', data.is_approved);
    setUser({
      token: data.access_token,
      role: data.role,
      userId: data.user_id,
      name: data.name,
      isApproved: data.is_approved,
    });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
