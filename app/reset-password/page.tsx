'use client';

import { useAppDispatch } from '@/store/hooks/reduxHooks';
import { resetPassword } from '@/store/slices/authSlice';
import { LockOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleResetPassword = async (values: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (!token) {
      message.error('Invalid reset token');
      return;
    }

    if (values.newPassword !== values.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await dispatch(resetPassword({
        token: token,
        newPassword: values.newPassword,
      })).unwrap();
      
      router.push('/login');
      
    } catch (error: any) {
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Reset Link</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The password reset link is invalid or has expired.
          </p>
          <Button 
            type="primary" 
            onClick={() => router.push('/login')}
            className="bg-green-600 hover:bg-green-700"
          >
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="max-w-md w-full shadow-lg">
        <div className="text-center mb-8">
          <LockOutlined className="text-4xl text-green-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reset Password
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Enter your new password below
          </p>
        </div>

        <Form
          form={form}
          onFinish={handleResetPassword}
          layout="vertical"
        >
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter your new password!' },
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
              className="bg-green-600 hover:bg-green-700 w-full"
              size="large"
            >
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}