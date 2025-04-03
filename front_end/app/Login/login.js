import React, {useState} from "react";
import styles from './login.module.css'
export const Login = (props) => {
    const { handler } = props
    const [ email, setEmail ] = useState('')
    const [ pwd, setPwd ] = useState('')
    const handleClick = () => {
        if(email !== '' && pwd !== '')
        handler(email, pwd)
    }
    const handleEmail = (e) => {
        setEmail(e.target.value)
    }
    const handlePwd = (e) => {
        setPwd(e.target.value)
    }
    return (    <main className={styles['login-container']}>
        <div className={styles['login-box']}>
          <h1>Shelter Management System</h1>
          <div
            className={styles['login-form']}
          >
            <div className={styles['form-group']}>
              <label htmlFor="username">Username</label>
              <input type="text" id="username" name="username" onChange={(e)=>handleEmail(e)} required />
            </div>
            <div className={styles['form-group']}>
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" onChange={(e)=>handlePwd(e)} required />
            </div>
            <button onClick = {()=>handleClick()} className={styles['login-button']}>
              Login
            </button>
          </div>
        </div>
      </main>)
}