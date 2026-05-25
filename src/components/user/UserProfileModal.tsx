import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/db';
import { User, Camera, Loader2, Check, Eye, EyeOff } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ open, onClose }: Props) {
  const [userData, setUserData] = useState<{ email: string; name: string; avatar: string; created: string } | null>(null);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Password state
  const [showPwd, setShowPwd] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdError, setPwdError] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Name state
  const [nameMsg, setNameMsg] = useState('');
  const [nameLoading, setNameLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const meta = data.user.user_metadata || {};
        setUserData({
          email: data.user.email || '',
          name: (meta.display_name as string) || data.user.email?.split('@')[0] || '',
          avatar: (meta.avatar_url as string) || '',
          created: data.user.created_at || '',
        });
        setName((meta.display_name as string) || '');
        setAvatarUrl((meta.avatar_url as string) || '');
      }
    });
  }, [open]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'avatars');
      setAvatarUrl(url);
      await supabase.auth.updateUser({ data: { avatar_url: url } });
    } catch { /**/ }
    setUploading(false);
  };

  const handleNameSave = async () => {
    if (!name.trim()) return;
    setNameLoading(true);
    try {
      await supabase.auth.updateUser({ data: { display_name: name.trim() } });
      setNameMsg('用户名已更新');
      setTimeout(() => setNameMsg(''), 2000);
    } catch {
      setNameMsg('更新失败');
    }
    setNameLoading(false);
  };

  const handlePasswordChange = async () => {
    setPwdMsg(''); setPwdError(false);
    if (!oldPwd) { setPwdMsg('请输入当前密码'); setPwdError(true); return; }
    if (newPwd.length < 6) { setPwdMsg('新密码至少6位'); setPwdError(true); return; }
    if (newPwd !== confirmPwd) { setPwdMsg('两次密码不一致'); setPwdError(true); return; }

    setPwdLoading(true);
    try {
      // Verify old password by signing in
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: userData?.email || '',
        password: oldPwd,
      });
      if (signInErr) {
        setPwdMsg('当前密码错误');
        setPwdError(true);
        setPwdLoading(false);
        return;
      }
      await supabase.auth.updateUser({ password: newPwd });
      setPwdMsg('密码已更新');
      setOldPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch {
      setPwdMsg('修改失败');
    }
    setPwdLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="个人主页" maxWidth="max-w-lg">
      <div className="space-y-6">
        {/* Avatar & Name */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden border-2 border-primary-200">
              {avatarUrl ? (
                <img src={avatarUrl} alt="头像" className="w-full h-full object-cover" />
              ) : (
                <User size={36} className="text-primary-400" />
              )}
            </div>
            <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
              <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleAvatarUpload} />
              {uploading ? <Loader2 size={20} className="animate-spin text-white" /> : <Camera size={20} className="text-white" />}
            </label>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <input
                type="text" className="input text-sm flex-1" value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="显示名称"
              />
              <button className="btn-primary text-xs !px-3 !py-1.5 flex items-center gap-1" onClick={handleNameSave} disabled={nameLoading}>
                {nameLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                保存
              </button>
            </div>
            {nameMsg && <p className="text-xs text-green-500">{nameMsg}</p>}
            <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">{userData?.email}</p>
            {userData?.created && (
              <p className="text-[10px] text-[rgb(var(--color-text-secondary))]">
                注册于 {new Date(userData.created).toLocaleDateString('zh-CN')}
              </p>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="border-t border-[rgb(var(--color-border))] pt-4">
          <h3 className="text-sm font-medium mb-3">修改密码</h3>
          <div className="space-y-3">
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} className="input w-full text-sm" placeholder="当前密码"
                value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} />
            </div>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} className="input w-full text-sm" placeholder="新密码（至少6位）"
                value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
            </div>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} className="input w-full text-sm" placeholder="确认新密码"
                value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-secondary))]" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {pwdMsg && (
              <p className={`text-xs ${pwdError ? 'text-red-500' : 'text-green-500'}`}>
                {!pwdError && <Check size={12} className="inline mr-1" />}
                {pwdMsg}
              </p>
            )}
            <button className="btn-primary text-sm w-full" onClick={handlePasswordChange} disabled={pwdLoading}>
              {pwdLoading && <Loader2 size={14} className="animate-spin inline mr-1" />}
              修改密码
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
