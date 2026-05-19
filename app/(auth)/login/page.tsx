'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import { login } from '@/store/slices/authSlice';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Typography } from "antd";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useEffect } from 'react';

const { Title, Text } = Typography;

export default function LoginPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const { isLoading, isAuthenticated, error } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/feed');
        }
    }, [isAuthenticated, router]);

    const onFinish = async (values: any) => {
        try {
            const resultAction = await dispatch(login({
                email: values.email,
                password: values.password
            })).unwrap();
            console.log('Login result:', resultAction);
        } catch (err) {
            console.error('Login failed:', err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
                <div className="text-center mb-8">
                    <Title level={2}>Welcome to Tottho Vandar</Title>
                    <Text type="secondary">Login to your account</Text>
                </div>

                <Form
                    form={form}
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Enter your email' },
                            { type: 'email', message: 'Enter a valid email' }
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Enter your password' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    {error && (
                        <div className="text-red-500 text-sm mb-4">{error}</div>
                    )}

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={isLoading}>
                            Login
                        </Button>
                    </Form.Item>

                    <div className="text-center space-y-2">
                        <Link href="/forgot-password" className="text-blue-500 block">
                            Forgot Password?
                        </Link>
                        <Text type="secondary">
                            New User?{' '}
                            <Link href="/signup" className="text-blue-500 hover:underline">
                                Sign up
                            </Link>
                        </Text>
                    </div>
                </Form>
            </div>
        </div>
    );
}