'use client';

import { useAppDispatch } from '@/store/hooks/reduxHooks';
import { verifyEmail } from '@/store/slices/authSlice';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Alert, Button, Result, Spin } from 'antd';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const token = searchParams.get('token');
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmailToken();
    } else {
      setVerificationStatus('error');
      setErrorMessage('No verification token provided');
    }
  }, [token]);

  const verifyEmailToken = async () => {
    try {
      await dispatch(verifyEmail(token!)).unwrap();
      setVerificationStatus('success');
    } catch (error: any) {
      setVerificationStatus('error');
      setErrorMessage(error.message || 'Failed to verify email. The link may have expired.');
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <div className="text-center py-12">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            <h2 className="text-2xl font-semibold mt-6 mb-2">Verifying your email...</h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </div>
        );

      case 'success':
        return (
          <Result
            icon={<CheckCircleOutlined className="text-green-500 text-6xl" />}
            status="success"
            title="Email Verified Successfully!"
            subTitle="Your email has been verified. You can now start posting and commenting."
            extra={[
              <Button 
                type="primary" 
                key="dashboard" 
                onClick={() => router.push('/feed')}
                className="bg-green-600 hover:bg-green-700"
              >
                Go to Feed
              </Button>
            ]}
          />
        );

      case 'error':
        return (
          <Result
            icon={<CloseCircleOutlined className="text-red-500 text-6xl" />}
            status="error"
            title="Verification Failed"
            subTitle={errorMessage || "We couldn't verify your email. The link may be invalid or expired."}
            extra={[
              <Button 
                type="primary" 
                key="resend" 
                onClick={handleResendVerification}
                loading={resendLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                Resend Verification Email
              </Button>,
              <Button key="home" onClick={() => router.push('/')}>
                Back to Home
              </Button>
            ]}
          >
            {resendSuccess && (
              <Alert
                message="Email Sent"
                description="We've sent a new verification link to your email address."
                type="success"
                showIcon
                className="mt-4"
              />
            )}
          </Result>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-serif font-bold text-gray-900">Tottho Vandar</h1>
          </Link>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}