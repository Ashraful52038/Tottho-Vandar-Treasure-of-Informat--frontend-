// app/profile/edit/page.tsx
'use client';

import { userService } from '@/lib/api/user';
import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import { updateUser } from '@/store/slices/authSlice'; // সঠিক অ্যাকশন ইম্পোর্ট করুন
import type { User } from '@/types/user';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Form, Input, message, Spin, Upload } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface FormValues {
  name: string;
  bio: string;
  email: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    form.setFieldsValue({
      name: user.name,
      bio: user.bio || '',
      email: user.email
    });
  }, [user, router, form]);

  const onFinish = async (values: FormValues) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const updatedUserData = await userService.updateProfile(values);
      
      // সঠিকভাবে updateUser অ্যাকশন ডিসপ্যাচ করুন
      dispatch(updateUser(updatedUserData));
      
      message.success('Profile updated successfully');
      router.push(`/profile/${user.id}`);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    
    setUploading(true);
    try {
      const { avatarUrl } = await userService.uploadAvatar(file);
      
      // ইউজার অবজেক্ট আপডেট করুন
      const updatedUserData: User = {
        ...user,
        avatar: avatarUrl
      };
      
      // সঠিকভাবে updateUser অ্যাকশন ডিসপ্যাচ করুন
      dispatch(updateUser(updatedUserData));
      
      message.success('Avatar updated successfully');
    } catch (error) {
      message.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card title="Edit Profile" className="shadow-sm">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Avatar
                  size={120}
                  src={user.avatar}
                  icon={<UserOutlined />}
                  className="border-4 border-green-500"
                />
                <Upload
                  showUploadList={false}
                  beforeUpload={(file) => {
                    handleAvatarUpload(file);
                    return false;
                  }}
                  accept="image/*"
                >
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<UploadOutlined />}
                    loading={uploading}
                    className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700"
                  />
                </Upload>
              </div>
            </div>

            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input placeholder="Your name" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
            >
              <Input disabled className="bg-gray-100" />
            </Form.Item>

            <Form.Item
              name="bio"
              label="Bio"
            >
              <Input.TextArea 
                rows={4} 
                placeholder="Tell us about yourself" 
                maxLength={200}
                showCount
              />
            </Form.Item>

            <Form.Item className="mb-0 flex justify-end gap-3">
              <Button onClick={() => router.back()}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                Save Changes
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}