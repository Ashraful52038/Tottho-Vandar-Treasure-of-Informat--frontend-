'use client';

import { postService } from '@/lib/api/posts';
import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import { createPost, fetchTags } from '@/store/slices/postSlice';
import {
  ArrowLeftOutlined,
  PlusOutlined
} from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  message,
  Select,
  Space,
  Spin,
  Upload
} from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
const { Option } = Select;

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

export default function CreatePostPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, tags: storeTags } = useAppSelector((state) => state.posts);
  const { user } = useAppSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      dispatch(fetchTags());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (storeTags && storeTags.length > 0) {
      console.log('Tags from database:', storeTags);
      setAvailableTags(storeTags);
    }
  }, [storeTags]);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/posts/create');
      return;
    }
    if (user && !user.verified) {
      router.push('/verify-email');
      return;
    }
  }, [user, router]);

  const handleSaveDraft = async () => {
    try {
      const values = form.getFieldsValue();
      
      if (!content || content === '<p><br></p>') {
        message.warning('Please write some content');
        return;
      }

      if (!values.tags || values.tags.length === 0) {
        message.warning('Please add at least one tag');
        return;
      }

      let imageUrl = featuredImage;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `http://localhost:8080${imageUrl}`;
      }

      // Use tagNames directly
      const tagNames = values.tags;

      await dispatch(createPost({
        title: values.title,
        content: content,
        tagNames: tagNames,
        featuredImage: imageUrl,
        published: false,
      })).unwrap();

      message.success('Post saved as draft!');
      router.push('/feed');
    } catch (error: any) {
      console.error('Save draft error:', error);
      message.error(error?.response?.data?.error || 'Failed to save draft');
    }
  };

  const handlePublish = async () => {
    try {
      const values = form.getFieldsValue();
      
      const hasContent = content && content.trim() !== '' && content !== '<p><br></p>';
      if (!hasContent) {
        message.warning('Please write some content');
        return;
      }

      if (!values.tags || values.tags.length === 0) {
        message.warning('Please add at least one tag');
        return;
      }

      const tagNames = values.tags;

      let imageUrl = featuredImage;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `http://localhost:8080${imageUrl}`;
      }

      console.log('🖼️ Processed imageUrl:', imageUrl);

      const postData = {
        title: values.title,
        content: content,
        tagNames: tagNames,
        featuredImage: imageUrl,
        published: true,
      };

      await dispatch(createPost(postData)).unwrap();

      message.success('Post published successfully!');
      router.push('/feed');
    } catch (error: any) {
      console.error('Publish error:', error);
      message.error(error?.response?.data?.error || 'Failed to publish post');
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const data = await postService.uploadImage(file);
      const formData = new FormData();
      formData.append('image', file);

      let imageUrl = data.url;
        if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `http://localhost:8080${imageUrl}`;
        }
    setFeaturedImage(imageUrl);
    message.success('Image uploaded successfully!');
    } catch (error) {
      message.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
    return false;
  };

  if (!isMounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (availableTags.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Loading tags..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/feed" className="text-gray-600 hover:text-gray-900">
                <ArrowLeftOutlined className="text-xl" />
              </Link>
              <h1 className="text-2xl font-serif font-bold text-gray-900">
                Write a Story
              </h1>
            </div>
            <Space>
              <Button onClick={handleSaveDraft} disabled={isLoading}>
                Save Draft
              </Button>
              <Button
                type="primary"
                onClick={handlePublish}
                loading={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                Publish
              </Button>
            </Space>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePublish}
          className="space-y-6"
        >
          <Form.Item
            name="title"
            rules={[
              { required: true, message: 'Please enter a title' },
              { min: 10, message: 'Title must be at least 10 characters' }
            ]}
          >
            <Input
              size="large"
              placeholder="Title"
              className="text-4xl font-serif border-0 border-b rounded-none px-0 focus:shadow-none"
              bordered={false}
            />
          </Form.Item>

          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Featured Image</h3>
            <Upload
              name="image"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={handleImageUpload}
              customRequest={({ onSuccess }) => {
                setTimeout(() => onSuccess?.('ok'), 0);
              }}
            >
              {featuredImage ? (
                <div className="relative group">
                  <img 
                    src={featuredImage} 
                    alt="featured" 
                    className="w-full h-full object-cover rounded-lg"
                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm">Click to change</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <PlusOutlined className="text-2xl" />
                  <div style={{ marginTop: 8 }}>Upload Image</div>
                </div>
              )}
            </Upload>
            {uploading && <Spin className="ml-4" />}
            {featuredImage && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <img 
                src={featuredImage} 
                alt="preview" 
                className="max-w-full max-h-75 object-contain border rounded-lg"
              />
            </div>
          )}
          </div>

          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Content</h3>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              placeholder="Write your story here..."
              className="min-h-100"
            />
          </div>
            {/* Tags */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Tags</h3>
            <Form.Item
              name="tags"
              rules={[
                { required: true, message: 'Please select at least one tag' }
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Select tags for your post"
                className="w-full"
              >
                {availableTags.map(tag => (
                  <Option key={tag.id} value={tag.name}>
                    {tag.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <p className="text-sm text-gray-500 mt-2">
              Add up to 5 tags to help readers find your story
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
}