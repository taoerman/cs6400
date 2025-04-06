"use client"
import { Dashboard } from "./Dashboard/Dashboard"
import { Sidebar } from "./Sidebar/Sidebar";
import { ViewProvider } from '@/contexts/ViewContext';
import { useEffect, useState } from "react";
import { setCookie, getCookie, getDataFromBackEnd, postDataToBackEnd } from "./utils";
import { Login } from './Login/login'


export default function Home() {
  const [login, setLogin] = useState(1)
  const [userEmail, setUserEmail] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (getCookie('loginType') !== "") {
      setLogin(getCookie('loginType'))
    }
  }, [])

  const handleLogin = async (email, password) => {
    try {
      const response = await postDataToBackEnd('accounts/login/', {
        userEmail: email,
        password
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const { token, first_name, last_name, is_exec, is_adult } = await response.json();
      localStorage.setItem('token', token);
      setUserEmail(email);
      setCookie('userEmail', email);
      setName(first_name + ' ' + last_name);
      setCookie('isAdult', is_adult);
      if (is_exec) {
        setCookie('loginType', 3)
        setLogin(3)
      } else {
        setCookie('loginType', 2)
        setLogin(2)
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || 'Network error. Check console for details.');
    }
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
          <Sidebar email={userEmail} logout={handleLogout} name={name} isExec={login === 3} />
          <Dashboard />
        </main>)}
    </ViewProvider>
  );
}
