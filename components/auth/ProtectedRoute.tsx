'use client';

import { useAppSelector } from '@/store/hooks/reduxHooks';
import { Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
        router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <Spin size="large" />
        </div>
        );
    }

    return isAuthenticated ? <>{children}</> : null;
}