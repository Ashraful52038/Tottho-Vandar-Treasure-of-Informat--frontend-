'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import { forgetPassword } from '@/store/slices/authSlice';
import { MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Typography } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const { Title, Text } = Typography;

export default function ForgotPasswordPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const { user } = useAppSelector((state) => state.auth);

    if (user) {
        router.push('/settings');
        return null;
    }

    const onFinish = async (values: { email: string }) => {
        setLoading(true);
        try {
            await dispatch(forgetPassword(values.email)).unwrap();
            message.success('Password reset email sent. Please check your inbox.');
            form.resetFields();
        } catch (error: any) {
            // Error handled by Redux state
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="max-w-md w-full shadow-2xl rounded-2xl border-0">
                <div className="text-center mb-8">
                    <div className="mx-auto h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                        <MailOutlined className="text-blue-600 text-2xl" />
                    </div>
                    <Title level={2} className="mb-2">Forgot Password?</Title>
                    <Text type="secondary" className="text-gray-500">
                        No worries! Enter your email and we'll send you a reset link.
                    </Text>
                </div>

                <Form
                    form={form}
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
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
                            prefix={<MailOutlined className="text-gray-400" />}
                            placeholder="your@email.com"
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            className="bg-blue-600 hover:bg-blue-700 h-10 rounded-lg"
                        >
                            Send Reset Link
                        </Button>
                    </Form.Item>

                    <div className="text-center">
                        <Link href="/login" className="text-blue-500 hover:text-blue-600">
                            ← Back to Login
                        </Link>
                    </div>
                </Form>

                <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-2 text-sm">
                    <SafetyOutlined className="text-blue-500 mt-0.5" />
                    <Text type="secondary" className="text-gray-600 dark:text-gray-300">
                        The reset link will expire in 1 hour. If you don't see the email, check your spam folder.
                    </Text>
                </div>
            </Card>
        </div>
    );
}