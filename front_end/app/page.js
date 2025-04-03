"use client"
import { Dashboard } from "./Dashboard/Dashboard"
import { Sidebar } from "./Sidebar/Sidebar";
import { ViewProvider } from '@/contexts/ViewContext';
import { useEffect, useState } from "react";
import { setCookie, getCookie } from "./utils";
import { Login } from './Login/login'
export default function Home() {
  const [ login, setLogin ] = useState(1)
  const setUserType = (email) => {
    fetch('http://127.0.0.1:8080/accounts/users/?email='+email).then((data)=>data.json()).then((user)=>{
      if(user[0].isExecutiveDirector){ 
      setCookie('loginType', 3)
      setLogin(3)
      }
      else{
      setCookie('loginType', 2)
      setLogin(2)
      }
    })
  }
  useEffect(()=>{
    if(getCookie('loginType') !== ""){
      setLogin(getCookie('loginType'))
    }
  },[])
  const handleLogin = (email, password) => {
    const body = {
      userEmail: email,
      password: password
    }
    fetch('http://127.0.0.1:8080/accounts/login/', {
      method:'POST',
      body: JSON.stringify(body)
    }).then((data)=>data.json()).then(()=>{
      setCookie('userEmail', email)
      setUserType(email)})
  }
  const handleLogout = () => {
    setCookie('loginType','',-1)
    setCookie('userEmail','',-1)
    setLogin(1)
  }
  return (
    <ViewProvider>
    { login === 1 ? <Login handler = {handleLogin} />:(
    <main className="grid gap-4 p-4 grid-cols-[200px_1fr]">
      <Sidebar logout = {handleLogout} />
      <Dashboard />
    </main>)}
    </ViewProvider>
  );
}
