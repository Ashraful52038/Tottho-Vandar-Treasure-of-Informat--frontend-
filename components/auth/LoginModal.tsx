'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import { clearError, login } from '@/store/slices/authSlice';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Typography } from "antd";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useEffect } from 'react';

const {Title , Text} = Typography;

interface LoginModalProps {
    isOpen: boolean;
    onClose?: () => void;
    onSignUpClick?: () => void;
}

export default function LoginModal({isOpen, onClose, onSignUpClick}: LoginModalProps){
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const { isLoading, isAuthenticated, error, user } = useAppSelector((state) => state.auth);

    // Form reset when modal closes
    useEffect(() => {
        if (!isOpen) {
            dispatch(clearError());
            form.resetFields();
        }
    }, [isOpen, dispatch, form]);


    useEffect(()=>{
        if (isAuthenticated) {
        if (onClose && typeof onClose === 'function') {
                onClose();
            }
        router.push('/feed');
        }
    },[isAuthenticated, router, onClose]);

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
        <Modal
            title={null}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={400}
            centered
        >
            <div className="text-center mb-8">
            <Title level={2}>Welcome to Tottho Vandar</Title>
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
                <span
                    onClick={() => onSignUpClick?.()} 
                    className="text-blue-500 cursor-pointer hover:underline"
                >
                Sign up
                </span>
            </Text>
        </div>
        </Form>
    </Modal>
    );
}