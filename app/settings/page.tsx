'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import { changePassword, forgetPassword } from '@/store/slices/authSlice';
import {
    CheckCircleFilled,
    LockOutlined,
    MailOutlined,
    SafetyOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Avatar, Button, Card, Form, Input, message, Tabs } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [changePasswordForm] = Form.useForm();
  const [forgotPasswordForm] = Form.useForm();

  // Redirect if not logged in
  if (!user) {
    router.push('/login');
    return null;
  }

  // Change Password Handler
  const handleChangePassword = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await dispatch(changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })).unwrap();
      
      changePasswordForm.resetFields();
      
    } catch (error: any) {
      // Error is already handled in slice with message.error
      console.error('Change password error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async (values: { email: string }) => {
    setLoading(true);
    try {
      await dispatch(forgetPassword(values.email)).unwrap();
      forgotPasswordForm.resetFields();
    } catch (error: any) {
      // Error is already handled in slice with message.error
      console.error('Forgot password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'change-password',
      label: (
        <span>
          <LockOutlined /> Change Password
        </span>
      ),
      children: (
        <Card title="Change Password" className="max-w-2xl">
          <Form
            form={changePasswordForm}
            onFinish={handleChangePassword}
            layout="vertical"
            className="mt-4"
          >
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[{ required: true, message: 'Please input your current password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter current password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please input your new password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter new password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm your new password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm new password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="bg-green-600 hover:bg-green-700"
                size="large"
              >
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'reset-password',
      label: (
        <span>
          <MailOutlined /> Forgot Password?
        </span>
      ),
      children: (
        <Card title="Reset Password" className="max-w-2xl">
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200">
              <SafetyOutlined className="mr-2" />
              Forgot your password? Enter your email address below and we'll send you a link to reset it.
            </p>
          </div>

          <Form
            form={forgotPasswordForm}
            onFinish={handleForgotPassword}
            layout="vertical"
          >
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter your registered email"
                size="large"
                defaultValue={user?.email}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="bg-green-600 hover:bg-green-700"
                size="large"
              >
                Send Reset Link
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Summary */}
        <Card className="mb-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Avatar
              size={64}
              src={user.avatar}
              icon={<UserOutlined />}
              className="border-2 border-green-500"
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              {user.verified && (
                <span className="inline-flex items-center gap-1 text-green-600 text-sm mt-1">
                  <CheckCircleFilled style={{ fontSize: '14px' }} />
                  Verified Account
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Card className="shadow-sm">
          <Tabs items={tabItems} defaultActiveKey="change-password" />
        </Card>
      </div>
    </div>
  );
}