'use client';

import { postService } from '@/lib/api/posts';
import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import { fetchPostById, fetchTags, updatePost } from '@/store/slices/postSlice';
import { getFullImageUrl } from '@/utils/imageUtils';
import {
  ArrowLeftOutlined,
  PlusOutlined
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Form,
  Input,
  message,
  Select,
  Spin,
  Upload
} from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
const { Option } = Select;

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean']
  ],
};

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentPost, isLoading, tags: storeTags } = useAppSelector((state) => state.posts);
  const { user, token } = useAppSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [availableTags, setAvailableTags] = useState<any[]>([]);

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
    if (params.id) {
      dispatch(fetchPostById(params.id as string));
    }
  }, [dispatch, params.id]);

  useEffect(() => {
    if (currentPost) {
      console.log('Post data from API:', currentPost);

      let postTags: string[] = [];
      if (currentPost.tags) {
        postTags = currentPost.tags.map((tag: any) => {
          if (typeof tag === 'string') return tag;
          if (tag && typeof tag === 'object') {
            return tag.name;
          }
          return String(tag);
        });
      }

      form.setFieldsValue({
        title: currentPost.title,
        tags: postTags,
      });
      setContent(currentPost.content);

      if (currentPost.featuredImage) {
        setFeaturedImage(currentPost.featuredImage);
      }
    }
  }, [currentPost, form]);

  // Check if user is author
  useEffect(() => {
    if (currentPost && user && currentPost.authorId !== user.id) {
      message.error('You are not authorized to edit this post');
      router.push(`/posts/${params.id}`);
    }
  }, [currentPost, user, params.id, router]);

  const handleImageUpload = async (file: RcFile) => {
    setUploading(true);
    try {
      const data = await postService.uploadImage(file);

      let imagePath = data.url;

      setFeaturedImage(imagePath);
      message.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
    return false;
  };

  const update = async (values: any) => {
    if (!content || content === '<p><br></p>') {
      message.warning('Please write some content');
      return;
    }

    if (!values.tags || values.tags.length === 0) {
      message.warning('Please select at least one tag');
      return;
    }

    const tagNames = values.tags;

    let imageUrl = featuredImage;

    const updateData = {
      title: values.title,
      content: content,
      tagNames: tagNames,
      featuredImage: imageUrl,
    };

    console.log('Updating post with data:', updateData);

    try {
      await dispatch(updatePost({
        id: params.id as string,
        data: updateData
      })).unwrap();

      message.success('Post updated successfully!');

      await dispatch(fetchPostById(params.id as string));
      
      router.push(`/posts/${params.id}`);
    } catch (error: any) {
      console.error('Update error:', error);
      message.error(error?.response?.data?.error || 'Failed to update post');
    }
  };

  const displayImageUrl = featuredImage ? getFullImageUrl(featuredImage) : '';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert message="Post not found" type="error" showIcon />
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
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/posts/${params.id}`} className="text-gray-600 hover:text-gray-900">
                <ArrowLeftOutlined className="text-xl" />
              </Link>
              <h1 className="text-2xl font-serif font-bold text-gray-900">
                Edit Post
              </h1>
            </div>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              Update
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={update}
          className="space-y-6"
        >
          {/* Title */}
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
              className="text-4xl font-serif border-0 border-b rounded-none px-0 hover:border-gray-300 focus:border-green-500"
              bordered={false}
            />
          </Form.Item>

          {/* Featured Image - CreatePostPage এর মতো */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
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
                    src={displayImageUrl}
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
                  src={displayImageUrl}
                  alt="preview"
                  className="max-w-full max-h-96 object-contain border rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Content</h3>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              className="min-h-100 mb-4"
              placeholder="Write your story..."
            />
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Tags</h3>
            <Form.Item
              name="tags"
              rules={[{ required: true, message: 'Please select at least one tag' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select tags"
                className="w-full"
                optionFilterProp="children"
                allowClear
              >
                {availableTags.map(tag => (
                  <Option key={tag.id} value={tag.name}>
                    {tag.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <p className="text-sm text-gray-500">
              Select tags to categorize your post
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
}