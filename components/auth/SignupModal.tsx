'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import { clearError, signup } from '@/store/slices/authSlice';
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, message, Modal, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from 'react';

const { Title, Text } = Typography;

interface SignupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginClick: () => void;
}

export default function SignupModal({ isOpen, onClose, onLoginClick }: SignupModalProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);
    const [form] = Form.useForm();

    // Error clear when component unmounts
    useEffect(() => {
        if (!isOpen) {
            dispatch(clearError());
            form.resetFields();
        }
    }, [isOpen, dispatch, form]);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            onClose();
            router.push(user.verified ? '/feed' : '/verify-email');
        }
    }, [isAuthenticated, user, router, onClose]);

    const onFinish = async (values: any) => {
        try {
            await dispatch(signup({
                name: values.name,
                email: values.email,
                password: values.password
            })).unwrap();

            // Success
            message.success('Account created! Please verify your email.');
            onClose();
            router.push('/verify-email');
        } catch (err: any) {
            const errorMsg = typeof err === 'string' ? err : err?.message || '';
            if (errorMsg.toLowerCase().includes('already exists')) {
                form.setFields([
                    {
                        name: 'email',
                        errors: ['This email is already registered. Please login or use another email.']
                    }
                ]);
            }
        }
    };

    return (
            <Modal
                title={null}
                open={isOpen}
                onCancel={onClose}
                footer={null}
                width={450}
                centered
            >
                <div className="text-center mb-8">
                    <Title level={2} className="dark:text-white">Create New Account</Title>
                    <Text type="secondary" className="dark:text-gray-400">
                        Join Tottho Vandar - Treasure of Information
                    </Text>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert
                        message="Registration Failed"
                        description={typeof error === 'string' ? error : 'Please try again '}
                        type="error"
                        showIcon
                        closable
                        onClose={() => dispatch(clearError())}
                        className="mb-4"
                    />
                )}

                <Form
                    form={form}
                    name="signup"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                    autoComplete="off"
                >
                    <Form.Item
                        name="name"
                        rules={[
                            { required: true, message: "Please enter your name" },
                            { min: 2, message: "Name must be at least 2 characters" },
                            { max: 50, message: "Name must be less than 50 characters" }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined className="text-gray-400" />}
                            placeholder="Full Name"
                            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            autoComplete="name"
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Please enter a valid email address' }
                        ]}
                        validateTrigger="onBlur"
                    >
                        <Input
                            prefix={<MailOutlined className="text-gray-400" />}
                            placeholder="Email Address"
                            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            autoComplete="email"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Please enter your password' },
                            { min: 6, message: 'Password must be at least 6 characters' },
                            {
                                pattern: /^(?=.*[A-Za-z])(?=.*\d)/,
                                message: 'Password must contain at least one letter and one number',
                            }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="Password"
                            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            autoComplete="new-password"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm your password' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Passwords do not match'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="Confirm Password"
                            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            autoComplete="new-password"
                        />
                    </Form.Item>

                    {/* Password strength indicator */}
                    <Form.Item shouldUpdate>
                        {() => {
                            const password = form.getFieldValue('password');
                            if (!password) return null;

                            const hasLetter = /[A-Za-z]/.test(password);
                            const hasNumber = /\d/.test(password);
                            const isLongEnough = password.length >= 6;

                            return (
                                <div className="mb-4 text-xs space-y-1">
                                    <div className={`flex items-center gap-1 ${hasLetter ? 'text-green-600' : 'text-gray-400'}`}>
                                        <span className="text-lg">•</span> At least one letter
                                    </div>
                                    <div className={`flex items-center gap-1 ${hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                                        <span className="text-lg">•</span> At least one number
                                    </div>
                                    <div className={`flex items-center gap-1 ${isLongEnough ? 'text-green-600' : 'text-gray-400'}`}>
                                        <span className="text-lg">•</span> Minimum 6 characters
                                    </div>
                                </div>
                            );
                        }}
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={isLoading}
                            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 h-10"
                        >
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </Form.Item>

                    <div className="text-center border-t border-gray-200 dark:border-gray-700 pt-4">
                        <Text type="secondary" className="dark:text-gray-400">
                            Already have an account?{' '}
                            <span
                                onClick={onLoginClick}
                                className="text-green-600 hover:text-green-700 dark:text-green-400 font-medium cursor-pointer"
                            >
                                Log In
                            </span>
                        </Text>
                    </div>
                </Form>
            </Modal>
    );
}