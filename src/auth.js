import { ref } from 'vue'
import { defineStore } from 'pinia'

export const demoAccount = {
  email: 'demo@mocstudio.vn',
  password: 'MocStudio123',
}

const sessionKey = 'moc-studio-demo-session'
const accountsKey = 'moc-studio-local-accounts'

function normalizeIdentifier(value) {
  return value.includes('@') ? value.trim().toLowerCase() : value.replace(/[\s().-]/g, '').replace(/^\+84/, '0')
}

function readAccounts() {
  const accounts = JSON.parse(localStorage.getItem(accountsKey) ?? '[]')
  return Array.isArray(accounts) ? accounts : []
}

async function hashPassword(password, salt) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const hash = await crypto.subtle.deriveBits({
    name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations: 600000,
  }, key, 256)
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('')
}

export const useAuth = defineStore('auth', () => {
  const signedIn = ref(false)
  try {
    signedIn.value = sessionStorage.getItem(sessionKey) === 'active'
  } catch {
    // The demo can still sign in when browser storage is unavailable.
  }

  function startSession() {
    signedIn.value = true
    try { sessionStorage.setItem(sessionKey, 'active') } catch {}
  }

  async function signIn(value, password) {
    const identifier = normalizeIdentifier(value)
    if (identifier === demoAccount.email && password === demoAccount.password) {
      startSession()
      return true
    }
    try {
      const account = readAccounts().find(item => item.identifier === identifier)
      if (!account || await hashPassword(password, account.salt) !== account.hash) return false
      startSession()
      return true
    } catch {
      return false
    }
  }

  async function register(value, password) {
    const identifier = normalizeIdentifier(value)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$|^0[0-9]{9}$/.test(identifier)) {
      return 'Vui lòng nhập email hợp lệ hoặc số điện thoại Việt Nam gồm 10 chữ số.'
    }
    if (password.length < 8 || password.length > 72) return 'Mật khẩu phải có từ 8 đến 72 ký tự.'
    try {
      const salt = crypto.randomUUID()
      const hash = await hashPassword(password, salt)
      const accounts = readAccounts()
      if (identifier === demoAccount.email || accounts.some(item => item.identifier === identifier)) {
        return 'Email hoặc số điện thoại này đã được đăng ký.'
      }
      localStorage.setItem(accountsKey, JSON.stringify([...accounts, { identifier, salt, hash }]))
      startSession()
      return ''
    } catch {
      return 'Không lưu được tài khoản mẫu trên trình duyệt này.'
    }
  }

  function signOut() {
    signedIn.value = false
    try { sessionStorage.removeItem(sessionKey) } catch {}
  }

  return { signedIn, signIn, signOut, register, signInDemo: startSession }
})
