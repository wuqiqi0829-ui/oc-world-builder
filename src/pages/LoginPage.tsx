import { useState, type FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

type Tab = 'login' | 'register' | 'forgot';

export default function LoginPage() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    setError('');
    if (!email.trim()) { setError('请输入邮箱'); return false; }
    if (!email.includes('@')) { setError('邮箱格式不正确'); return false; }
    if (tab !== 'forgot') {
      if (password.length < 6) { setError('密码至少 6 位'); return false; }
      if (tab === 'register' && password !== confirmPassword) {
        setError('两次密码不一致'); return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError('');
    setMessage('');

    if (tab === 'login') {
      const { error: err } = await signIn(email, password);
      if (err) setError(err);
    } else if (tab === 'register') {
      const { error: err } = await signUp(email, password);
      if (err) setError(err);
      else setMessage('注册成功！请检查邮箱确认链接。');
    } else if (tab === 'forgot') {
      const { error: err } = await resetPassword(email);
      if (err) setError(err);
      else setMessage('密码重置链接已发送到你的邮箱。');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="#7C5CBF"/>
              <path d="M24 10C18.5 10 14 14.5 14 20c0 5 3.5 9 8 10.5V36l4-2 4 2v-5.5c4.5-1.5 8-5.5 8-10.5 0-5.5-4.5-10-10-10h-4z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[rgb(var(--color-text))]">OC World Builder</h1>
          <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">世界观收纳整理软件</p>
        </div>

        <div className="card">
          <div className="flex border-b border-[rgb(var(--color-border))] mb-4">
            {([
              ['login', '登录'],
              ['register', '注册'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setTab(key); setError(''); setMessage(''); }}
                className={`flex-1 pb-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text))]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-[rgb(var(--color-text-secondary))] mb-1 block">邮箱</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-secondary))]" />
                <input
                  type="email"
                  className="input pl-9 w-full"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {tab !== 'forgot' && (
              <div>
                <label className="text-xs text-[rgb(var(--color-text-secondary))] mb-1 block">密码</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-secondary))]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input pl-9 pr-9 w-full"
                    placeholder="至少 6 位"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[rgb(var(--color-text-secondary))]"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}

            {tab === 'register' && (
              <div>
                <label className="text-xs text-[rgb(var(--color-text-secondary))] mb-1 block">确认密码</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-secondary))]" />
                  <input
                    type="password"
                    className="input pl-9 w-full"
                    placeholder="再次输入密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-input">
                {error}
              </div>
            )}

            {message && (
              <div className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-input">
                {message}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {tab === 'login' ? '登录' : tab === 'register' ? '注册' : '发送重置链接'}
            </button>

            <div className="text-center">
              {tab === 'login' ? (
                <button
                  type="button"
                  onClick={() => { setTab('forgot'); setError(''); setMessage(''); }}
                  className="text-xs text-primary-600 hover:underline"
                >
                  忘记密码？
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setTab('login'); setError(''); setMessage(''); }}
                  className="text-xs text-primary-600 hover:underline"
                >
                  已有账号？去登录
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
