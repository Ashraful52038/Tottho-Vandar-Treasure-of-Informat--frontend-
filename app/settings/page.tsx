'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import { changePassword, forgetPassword, setNotificationsEnabled } from '@/store/slices/authSlice';
import { getFullImageUrl } from '@/utils/imageUtils';
import {
  ArrowLeftOutlined, // ✅ যোগ করুন
  BellFilled,
  BellOutlined,
  KeyOutlined,
  LockOutlined,
  MailOutlined,
  QuestionCircleOutlined,
  SafetyOutlined,
  SendOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Avatar, Switch, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const faqItems = [
  { q: 'How do I change my password?', a: 'Go to "Change Password", enter your current password and new password, then click Update.' },
  { q: 'What if I forgot my current password?', a: 'Use the "Forgot Password" tab, enter your email and we\'ll send a reset link.' },
  { q: 'How long is the reset link valid?', a: 'The reset link expires in 1 hour. You can always request a new one.' },
  { q: 'Why do I need my current password?', a: 'It ensures only you can modify your password and prevents unauthorized changes.' },
  { q: 'Can I reuse an old password?', a: 'No. We recommend a completely new password you haven\'t used recently.' },
  { q: 'What makes a strong password?', a: 'At least 8 characters with uppercase, lowercase, numbers, and symbols.' },
];

export default function SettingsPage() {
  const { user , preferences } = useAppSelector((state) => state.auth);
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
  if (checked) {
    message.success('Notifications enabled');
  } else {
    message.info('Notifications disabled');
  }
};

  const inputCls = 'w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e8e5df] outline-none focus:border-green-600 focus:ring-2 focus:ring-green-50 transition-all bg-white';

  return (
    <div className="min-h-screen bg-[#f5f4f0] py-6 px-4 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
        >
          <ArrowLeftOutlined /> Back
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-[#e8e5df] overflow-hidden mb-5">
          <div className="h-24 bg-linear-to-r from-[#2d6a4f] via-[#40916c] to-[#74c69d]" />
          <div className="px-7 pb-6">
            <div className="flex items-end gap-5 -mt-11 mb-4">
              <Avatar
                size={84}
                src={getFullImageUrl(user.avatar)}
                icon={<UserOutlined />}
                className="border-[3px] border-white shadow-md shrink-0"
                style={{ background: '#d8f3dc', color: '#2d6a4f' }}
              />
              <div className="pb-1 mt-20">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  {user.name}
                  {/* {user.verified && <CheckCircleFilled className="text-sky-500 text-base" />} */}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-[#f5f4f0] px-3 py-1.5 rounded-full border border-[#e8e5df]">
                <UserOutlined /> Member since {memberSince}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                <SafetyOutlined /> Account Secured
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left: Forms */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e8e5df] overflow-hidden">

            {/* Tab Nav */}
            <div className="flex border-b border-[#e8e5df] px-2">
              {([
                { key: 'change', label: 'Change Password', icon: <KeyOutlined /> },
                { key: 'forgot', label: 'Forgot Password', icon: <SendOutlined /> },
              ] as const).map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 -mb-px transition-all whitespace-nowrap
                    ${activeTab === t.key
                      ? 'border-green-700 text-green-700'
                      : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Change Password */}
            {activeTab === 'change' && (
              <div className="p-7">
                <h3 className="text-base font-semibold text-gray-800 mb-1">Update your password</h3>
                <p className="text-sm text-gray-400 mb-6">Enter your current password before setting a new one.</p>

                <div className="flex flex-col gap-4 max-w-md">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Current Password</label>
                    <div className="relative">
                      <LockOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password" className={`${inputCls} pl-9`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">New Password</label>
                    <div className="relative">
                      <LockOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters" className={`${inputCls} pl-9`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <LockOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password" className={`${inputCls} pl-9`} />
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:opacity-60 transition-colors mt-1"
                  >
                    <KeyOutlined /> {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password */}
            {activeTab === 'forgot' && (
              <div className="p-7">
                <h3 className="text-base font-semibold text-gray-800 mb-1">Reset your password</h3>
                <p className="text-sm text-gray-400 mb-6">We'll send a secure reset link to your email.</p>

                <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 max-w-md">
                  <SafetyOutlined className="text-blue-500 text-base mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">What happens next?</p>
                    <p className="text-xs text-blue-600 mt-0.5">You'll get an email with a secure link. Click it to set a new password. The link expires in 1 hour.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 max-w-md">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Email Address</label>
                    <div className="relative">
                      <MailOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="Enter your registered email" className={`${inputCls} pl-9`} />
                    </div>
                  </div>

                  <button
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                  >
                    <SendOutlined /> {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </div>
            )}
          </div>

           {/* ✅ Notification Settings Card - Add this */}
          <div className="bg-white rounded-2xl border border-[#e8e5df] p-6">
            <div className="flex items-center gap-2 mb-4">
              {notificationsEnabled ? (
                <BellFilled className="text-green-500 text-lg" />
              ) : (
                <BellOutlined className="text-gray-400 text-lg" />
              )}
              <h3 className="text-sm font-semibold text-gray-700">Notification Settings</h3>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-800">Push Notifications</p>
                <p className="text-xs text-gray-400 mt-0.5">Get real-time alerts for likes, comments & follows</p>
              </div>
              <Switch
                  checked={notificationsEnabled}
                  onChange={handleNotificationToggle}
                  className="bg-gray-300"
                  checkedChildren={<BellFilled />}
                  unCheckedChildren={<BellOutlined />}
                />
              </div>
              
              {!notificationsEnabled && (
                <div className="mt-3 pt-3 border-t border-[#e8e5df]">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <SafetyOutlined className="text-xs" />
                    Notifications are paused. You won't receive any alerts.
                  </p>
                </div>
              )}
            </div>

          {/* Right: FAQ */}
          <div className="bg-white rounded-2xl border border-[#e8e5df] p-6">
            <div className="flex items-center gap-2 mb-5">
              <QuestionCircleOutlined className="text-blue-500 text-base" />
              <h3 className="text-sm font-semibold text-gray-700">FAQs</h3>
            </div>
            <div className="flex flex-col gap-2">
              {faqItems.map((item, i) => (
                <div key={i} className="border border-[#e8e5df] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-[#f5f4f0] transition-colors"
                  >
                    <span>{item.q}</span>
                    <span className={`text-gray-400 text-xs shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-3 text-xs text-gray-500 leading-relaxed border-t border-[#e8e5df] pt-3 bg-[#faf9f7]">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}