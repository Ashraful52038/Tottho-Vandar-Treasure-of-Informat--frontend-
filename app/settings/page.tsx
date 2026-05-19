'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import { changePassword, forgetPassword, setNotificationsEnabled } from '@/store/slices/authSlice';
import { getFullImageUrl } from '@/utils/imageUtils';
import {
  ArrowLeftOutlined,
  BellFilled,
  BellOutlined,
  KeyOutlined,
  LockOutlined,
  MailOutlined,
  QuestionCircleOutlined,
  SafetyOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Switch, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const faqItems = [
  { q: 'How do I change my password?', a: 'Go to "Change Password", enter your current password and new password, then click Update.' },
  { q: 'What if I forgot my current password?', a: "Use the \"Forgot Password\" tab, enter your email and we'll send a reset link." },
  { q: 'How long is the reset link valid?', a: 'The reset link expires in 1 hour. You can always request a new one.' },
  { q: 'Why do I need my current password?', a: 'It ensures only you can modify your password and prevents unauthorized changes.' },
  { q: 'Can I reuse an old password?', a: "No. We recommend a completely new password you haven't used recently." },
  { q: 'What makes a strong password?', a: 'At least 8 characters with uppercase, lowercase, numbers, and symbols.' },
];

export default function SettingsPage() {
  const { user, preferences } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const notificationsEnabled = preferences?.notificationsEnabled ?? true;

  const [activeTab, setActiveTab] = useState<'change' | 'forgot'>('change');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');

  if (!user) { router.push('/login'); return null; }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  const handleChangePassword = async () => {
    if (!currentPassword) { message.error('Enter your current password'); return; }
    if (newPassword.length < 6) { message.error('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { message.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await dispatch(changePassword({ currentPassword, newPassword })).unwrap();
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      message.success('Password changed successfully!');
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleForgotPassword = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) { message.error('Enter a valid email'); return; }
    setLoading(true);
    try {
      await dispatch(forgetPassword(email)).unwrap();
      setEmail('');
      message.success('Reset link sent to your email!');
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleNotificationToggle = (checked: boolean) => {
    dispatch(setNotificationsEnabled(checked));
    checked ? message.success('Notifications enabled') : message.info('Notifications disabled');
  };

  const inputCls =
    'w-full px-4 py-3 text-sm rounded-lg border border-[#ddd8cc] bg-[#faf9f6] outline-none ' +
    'focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 transition-all placeholder:text-[#b0a898] text-[#1a1612]';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .sr { font-family: 'DM Sans', sans-serif; }
        .sr .serif { font-family: 'Playfair Display', Georgia, serif; }
        .sr input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #faf9f6 inset !important;
          -webkit-text-fill-color: #1a1612 !important;
        }
        .faq-ans { animation: fsIn 0.18s ease; }
        @keyframes fsIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
        .sr .ant-switch-checked { background-color: #2d6a4f !important; }
      `}</style>

      <div className="sr min-h-screen bg-[#f0ede6] py-8 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Back */}
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-[10px] font-semibold text-[#8a7f72] hover:text-[#2d6a4f] mb-7 transition-colors tracking-[0.2em] uppercase"
          >
            <ArrowLeftOutlined className="transition-transform group-hover:-translate-x-0.5" />
            Back
          </button>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-[#e4dfd6] overflow-hidden mb-6 shadow-sm">
            <div className="relative h-28 bg-[#add6c6] overflow-hidden">
              <div className="absolute inset-0 opacity-[0.07]"
                style={{ backgroundImage: 'repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)' }} />
            </div>
            <div className="px-8 pb-7">
              <div className="flex items-end gap-5 -mt-11 mb-5">
                <Avatar
                  size={88}
                  src={getFullImageUrl(user.avatar)}
                  icon={<UserOutlined />}
                  className="shrink-0"
                  style={{ border: '3px solid white', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', background: '#d8f3dc', color: '#2d6a4f' }}
                />
                <div className="pb-1">
                  <h2 className="serif text-2xl font-semibold text-[#1a1612] relative z-50">{user.name}</h2>
                  <p className="text-sm text-[#8a7f72] mt-0.5">{user.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <span className="flex items-center gap-1.5 text-xs text-[#6b6259] bg-[#f0ede6] px-3.5 py-1.5 rounded-full border border-[#ddd8cc]">
                  <UserOutlined className="text-[10px]" /> Member since {memberSince}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-[#2d6a4f] bg-[#eaf4ee] px-3.5 py-1.5 rounded-full border border-[#b7dfc5]">
                  <SafetyOutlined className="text-[10px]" /> Account Secured
                </span>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Password forms */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e4dfd6] overflow-hidden shadow-sm">

              {/* Tabs */}
              <div className="flex border-b border-[#e4dfd6] px-1">
                {([
                  { key: 'change', label: 'Change Password', icon: <KeyOutlined /> },
                  { key: 'forgot', label: 'Forgot Password', icon: <SendOutlined /> },
                ] as const).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`flex items-center gap-2 px-5 py-4 text-[10px] font-bold border-b-2 -mb-px transition-all whitespace-nowrap tracking-[0.15em] uppercase
                      ${activeTab === t.key ? 'border-[#2d6a4f] text-[#2d6a4f]' : 'border-transparent text-[#b0a898] hover:text-[#6b6259]'}`}
                  >
                    {t.icon}<span>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Change Password */}
              {activeTab === 'change' && (
                <div className="p-8">
                  <p className="serif text-xl font-semibold text-[#1a1612] mb-1">Update your password</p>
                  <p className="text-sm text-[#8a7f72] mb-7">Enter your current password before setting a new one.</p>

                  <div className="flex flex-col gap-5 max-w-sm">
                    {[
                      { label: 'Current Password', value: currentPassword, setter: setCurrentPassword, placeholder: 'Enter current password' },
                      { label: 'New Password', value: newPassword, setter: setNewPassword, placeholder: 'At least 6 characters' },
                      { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword, placeholder: 'Repeat new password' },
                    ].map(({ label, value, setter, placeholder }) => (
                      <div key={label}>
                        <label className="block text-[10px] font-bold text-[#6b6259] mb-2 tracking-[0.15em] uppercase">{label}</label>
                        <div className="relative">
                          <LockOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b0a898] text-xs" />
                          <input type="password" value={value} onChange={(e) => setter(e.target.value)}
                            placeholder={placeholder} className={`${inputCls} pl-9`} />
                        </div>
                        {label === 'Confirm New Password' && confirmPassword && newPassword !== confirmPassword && (
                          <p className="text-xs text-red-500 mt-1.5">Passwords do not match</p>
                        )}
                      </div>
                    ))}

                    <div className="h-px bg-linear-to-r from-[#c9a84c]/40 to-transparent mt-1" />

                    <button
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 px-5 py-3 text-[10px] font-bold rounded-lg bg-[#1a3329] text-white hover:bg-[#2d6a4f] disabled:opacity-50 transition-colors tracking-[0.2em] uppercase"
                    >
                      <KeyOutlined />{loading ? 'Updating…' : 'Update Password'}
                    </button>
                  </div>
                </div>
              )}

              {/* Forgot Password */}
              {activeTab === 'forgot' && (
                <div className="p-8">
                  <p className="serif text-xl font-semibold text-[#c2f02c] mb-1">Reset your password</p>
                  <p className="text-sm text-[#8a7f72] mb-7">We'll send a secure reset link to your email address.</p>

                  <div className="flex items-start gap-3 bg-[#f7f5f0] border border-[#ddd8cc] rounded-xl p-4 mb-7 max-w-sm">
                    <SafetyOutlined className="text-[#c9a84c] text-sm mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#3d2e1a] mb-1 tracking-wide">What happens next?</p>
                      <p className="text-xs text-[#8a7f72] leading-relaxed">You'll receive a link valid for 1 hour. Click it to set a new password.</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5 max-w-sm">
                    <div>
                      <label className="block text-[10px] font-bold text-[#6b6259] mb-2 tracking-[0.15em] uppercase">Email Address</label>
                      <div className="relative">
                        <MailOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b0a898] text-xs" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your registered email" className={`${inputCls} pl-9`} />
                      </div>
                    </div>

                    <div className="h-px bg-linear-to-r from-[#c9a84c]/40 to-transparent" />

                    <button
                      onClick={handleForgotPassword}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 px-5 py-3 text-[10px] font-bold rounded-lg bg-[#1a3329] text-white hover:bg-[#2d6a4f] disabled:opacity-50 transition-colors tracking-[0.2em] uppercase"
                    >
                      <SendOutlined />{loading ? 'Sending…' : 'Send Reset Link'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-5">

              {/* Notifications */}
              <div className="bg-white rounded-2xl border border-[#e4dfd6] p-6 shadow-sm">
                <div className="flex items-center gap-2.5 pb-4 border-b border-[#f0ede6] mb-4">
                  {notificationsEnabled
                    ? <BellFilled className="text-[#2d6a4f]" />
                    : <BellOutlined className="text-[#b0a898]" />}
                  <p className="serif text-base font-semibold text-[#1a1612]">Notifications</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#1a1612]">Push Alerts</p>
                    <p className="text-xs text-[#8a7f72] mt-0.5">Likes, comments &amp; follows</p>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onChange={handleNotificationToggle}
                    checkedChildren={<BellFilled />}
                    unCheckedChildren={<BellOutlined />}
                  />
                </div>

                {!notificationsEnabled && (
                  <div className="mt-4 pt-4 border-t border-[#f0ede6]">
                    <p className="text-xs text-[#b0a898] flex items-center gap-1.5 leading-relaxed">
                      <SafetyOutlined className="shrink-0" />
                      Notifications paused. You won't receive alerts.
                    </p>
                  </div>
                )}
              </div>

              {/* FAQ */}
              <div className="bg-white rounded-2xl border border-[#e4dfd6] p-6 shadow-sm flex-1">
                <div className="flex items-center gap-2.5 pb-4 border-b border-[#f0ede6] mb-4">
                  <QuestionCircleOutlined className="text-[#c9a84c]" />
                  <p className="serif text-base font-semibold text-[#1a1612]">Help &amp; FAQs</p>
                </div>

                <div className="flex flex-col gap-2">
                  {faqItems.map((item, i) => (
                    <div key={i} className="border border-[#e4dfd6] rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex justify-between items-center gap-3 px-4 py-3 text-left text-xs font-semibold text-[#3d3028] hover:bg-[#f7f5f1] transition-colors"
                      >
                        <span className="leading-snug">{item.q}</span>
                        <span className={`text-[#c9a84c] text-[9px] shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                      </button>
                      {openFaq === i && (
                        <div className="faq-ans px-4 pb-3.5 pt-3 text-xs text-[#6b6259] leading-relaxed border-t border-[#f0ede6] bg-[#faf9f6]">
                          {item.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Footer wordmark */}
          <div className="mt-10 text-center">
            <div className="h-px w-8 bg-[#c9a84c] mx-auto mb-3" />
            <p className="serif text-[10px] font-bold text-[#c9a84c] tracking-[0.35em] uppercase">Tottho Vandar</p>
            <p className="text-[10px] text-[#b0a898] mt-1 tracking-wide">© 2026 · Treasure of Information</p>
          </div>

        </div>
      </div>
    </>
  );
}