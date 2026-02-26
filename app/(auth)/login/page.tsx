'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import { login } from '@/store/slices/authSlice';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Typography } from "antd";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useEffect } from 'react';

const {Title , Text} = Typography;

export default function LoginPage(){
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isLoading, isAuthenticated, error } = useAppSelector((state) => state.auth);

    useEffect(()=>{
        if (isAuthenticated) {
        router.push('/feed');
        }
    },[isAuthenticated, router]);

    const onFinish = async (values: any) => {
        await dispatch(login({ email: values.email, password: values.password }));
    };

    return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
    <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
            <Title level={2}>Welcome</Title>
            <Text type="secondary">Login to your account</Text>
        </div>

        <Form
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
                <Input prefix={<UserOutlined />} placeholder="email" />
            </Form.Item>

            <Form.Item
            name="password"
            rules={[{ required: true, message: 'Enter your password' }]}
            >
            <Input.Password prefix={<LockOutlined />} placeholder="password" />
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
                Forget Password?
            </Link>
            <Text type="secondary">
                New User?{' '}
                <Link href="/signup" className="text-blue-500">
                Sign up
                </Link>
            </Text>
        </div>
        </Form>
        </Card>
        </div>
    );
}