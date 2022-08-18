const validateRegisterRoute = (name, email, password) => {
  const errors = {}
  if (name.trim() === '') {
    errors.name = 'İsim gereklidir'
  }
  if (name.length > 30) {
    errors.name = 'İsim 30 karakterden fazla olamaz'
  }
  if (email.trim() === '') {
    errors.email = 'Eposta gereklidir'
  } else {
    const regEx =
      /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/
    if (!email.match(regEx)) {
      errors.email = 'Geçerli bir eposta adresi giriniz'
    }
  }
  if (email.length > 60) {
    errors.name = 'Eposta 60 karakterden fazla olamaz'
  }
  if (password === '') {
    errors.password = 'Şifre gereklidir'
  }
  if (password.length < 8) {
    errors.password = 'Şifreniz en az 8 karakter olmalıdır'
  }
  if (password.length > 30) {
    errors.password = 'Şifreniz en fazla 30 karakter olmalıdır'
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1,
  }
}

const validateLoginRoute = (email, password) => {
  const errors = {}
  if (email.trim() === '') {
    errors.email = 'Eposta gereklidir'
  }
  if (password.trim() === '') {
    errors.password = 'Şifre gereklidir'
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1,
  }
}

const validateResetPasswordRoute = (password) => {
  const errors = {}
  if (password === '') {
    errors.password = 'Şifre gereklidir'
  }
  if (password.length < 8) {
    errors.password = 'Şifreniz en az 8 karakter olmalıdır'
  }
  if (password.length > 30) {
    errors.password = 'Şifreniz en fazla 30 karakter olmalıdır'
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1,
  }
}

const validateUpdatePasswordRoute = (password, newPassword) => {
  const errors = {}
  if (password === '') {
    errors.password = 'Şifre gereklidir'
  }
  if (newPassword === '') {
    errors.newPassword = 'Yeni şifre gereklidir'
  }
  if (password.length < 8) {
    errors.password = 'Şifreniz en az 8 karakter olmalıdır'
  }
  if (password.length > 30) {
    errors.password = 'Şifreniz en fazla 30 karakter olmalıdır'
  }
  if (newPassword.length < 8) {
    errors.newPassword = 'Yeni şifreniz en az 8 karakter olmalıdır'
  }
  if (newPassword.length > 30) {
    errors.password = 'Yeni şifreniz en fazla 30 karakter olmalıdır'
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1,
  }
}

export {
  validateRegisterRoute,
  validateLoginRoute,
  validateResetPasswordRoute,
  validateUpdatePasswordRoute,
}
