import React, { useState, useEffect} from 'react';

export default function Login() {
  const [email, setEmail] = useState()
  const [password, setPassword] = useState()

  const handleLogin = async(e) => {
    e.preventDefault();
  }

  return (
    <div>
      <form onSubmit={handleLogin} className=''>
        <label htmlfor='email'>Email</label>
        <input onChange={(e) => setEmail(e.target.value)}  type='email' name='email' className='' />

        <label htmlfor='password'>Senha</label>
        <input onChange={(e) => setPassword(e.target.value)} type='password' name='password' className='' />

        <input type='submit' value='Entrar' className='' />
      </form>
    </div>
  )
}
