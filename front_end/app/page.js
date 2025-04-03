"use client"
import { Dashboard } from "./Dashboard/Dashboard"
import { Sidebar } from "./Sidebar/Sidebar";
import { ViewProvider } from '@/contexts/ViewContext';
import { useEffect, useState } from "react";
import { setCookie, getCookie } from "./utils";
import { Login } from './Login/login'
export default function Home() {
  const [login, setLogin] = useState(1)
  const setUserType = (email) => {
    fetch('http://127.0.0.1:8000/accounts/users/?email=' + email).then((data) => data.json()).then((user) => {
      if (user[0].isExecutiveDirector) {
        setCookie('loginType', 3)
        setLogin(3)
      }
      else {
        setCookie('loginType', 2)
        setLogin(2)
      }
    })
  }
  useEffect(() => {
    if (getCookie('loginType') !== "") {
      setLogin(getCookie('loginType'))
    }
  }, [])

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/accounts/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setCookie('userEmail', email);
      setUserType(email);
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || 'Network error. Check console for details.');
    }
  };

  const fetchProtectedData = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://your-server/api/protected', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  };
  const handleLogout = () => {
    setCookie('loginType', '', -1)
    setCookie('userEmail', '', -1)
    setLogin(1)
  }
  return (
    <ViewProvider>
      {login === 1 ? <Login handler={handleLogin} /> : (
        <main className="grid gap-4 p-4 grid-cols-[200px_1fr]">
          <Sidebar logout={handleLogout} />
          <Dashboard />
        </main>)}
    </ViewProvider>
  );
}
