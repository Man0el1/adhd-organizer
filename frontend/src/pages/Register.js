import React, { useState, useEffect} from 'react';

export default function Register() {
  const [email, setEmail] = useState()
  const [password, setPassword] = useState()
  const [confirmPassword, setConfirmPassword] = useState()

  const handleRegister = async(e) => {
    e.preventDefault();
  }

  return (
    <div>
      <form onSubmit={handleRegister} className=''>
        <label htmlfor='email'>Email</label>
        <input onChange={(e) => setEmail(e.target.value)}  type='email' name='email' className='' />

        <label htmlfor='password'>Senha</label>
        <input onChange={(e) => setPassword(e.target.value)} type='password' name='password' className='' />

        <label htmlfor='confirmpassword'>Confirmar Senha</label>
        <input onChange={(e) => setConfirmPassword(e.target.value)} type='password' name='confirmpassword' className='' />

        <input type='submit' value='Criar conta' className='' />
      </form>
    </div>
  )
}
