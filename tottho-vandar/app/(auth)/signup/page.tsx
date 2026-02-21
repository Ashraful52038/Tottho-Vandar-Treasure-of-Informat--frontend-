'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import { signup } from '@/store/slices/authSlice';
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Typography } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

export default function SignupPage(){
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state)=> state.auth);

    const onFinish = async (values: any)=>{
        await dispatch(signup({
            name: values.name,
            email: values.email,
            password: values.password
        }));
        router.push('/verify-email');
    };

    return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md shadow-lg">
            <div className="text-center mb-8">
                <Title level={2}>New Account</Title>
                <Text type="secondary">Add on Treasure of Information</Text>
            </div>

            <Form
                name="signup"
                onFinish={onFinish}
                layout="vertical"
                size="large"
            >
            <Form.Item
                name="name"
                rules={[{ required: true, message:"Enter your name"}]}
            >
                <Input prefix={<UserOutlined />} placeholder="Enter your name" />
            </Form.Item>

            <Form.Item
            name="email"
            rules={[
                { required: true, message: 'Enter your email' },
                { type: 'email', message: 'Enter a valid email' }
            ]}
            >
                <Input prefix={<MailOutlined />} placeholder="email" />
            </Form.Item>

            <Form.Item
                name="password"
                rules={[
                    { required: true, message: 'Enter your password' },
                    { min: 6, message: 'Password must be at least 6 character' }
                ]}
                >
                <Input.Password prefix={<LockOutlined />} placeholder="password" />
            </Form.Item>

            <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                    { required: true, message: 'Confirm password' },
                    ({ getFieldValue }) => ({
                    validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                        }
                        return Promise.reject(new Error('Password do not match'));
                    },
                    }),
                ]}
                >
                <Input.Password prefix={<LockOutlined />} placeholder="Confirm password" />
            </Form.Item>
                {error && (
            <div className="text-red-500 text-sm mb-4">{error}</div>
            )}

            <Form.Item>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
                Sign Up
            </Button>
            </Form.Item>

            <div className="text-center">
            <Text type="secondary">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-500">
                Log In
                </Link>
            </Text>
            </div>
            </Form>
        </Card>
        </div>
    )
}