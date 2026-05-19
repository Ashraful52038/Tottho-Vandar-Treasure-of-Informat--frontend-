'use client';

import { postService } from '@/lib/api/posts';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Select, Spin, Upload } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
const { Option } = Select;

export const QUILL_MODULES = {
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

export interface PostFormData {
  title: string;
  content: string;
  tags: string[];
  featuredImage: string;
}

interface PostEditorProps {
  tags: any[];
  initialData?: PostFormData;
  isLoading: boolean;
  mode: 'create' | 'edit';
  onSubmit: (data: PostFormData, published: boolean) => Promise<void>;
  onImageUpload?: (url: string) => void;
}

export default function PostEditor({
  tags,
  initialData,
  isLoading,
  mode,
  onSubmit,
  onImageUpload,
}: PostEditorProps) {
  const [form] = Form.useForm();
  const [content, setContent] = useState(initialData?.content || '');
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || '');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        title: initialData.title,
        tags: initialData.tags,
      });
      setContent(initialData.content);
      setFeaturedImage(initialData.featuredImage);
    }
  }, [initialData, form]);

  const handleImageUpload = async (file: RcFile) => {
    setUploading(true);
    try {
      const data = await postService.uploadImage(file);
      let imageUrl = data.url;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${imageUrl}`;
      }
      setFeaturedImage(imageUrl);
      onImageUpload?.(imageUrl);
      message.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleSubmit = async (published: boolean) => {
    try {
      const values = await form.validateFields();

      if (!content || content === '<p><br></p>') {
        message.warning('Please write some content');
        return;
      }

      if (!values.tags || values.tags.length === 0) {
        message.warning('Please select at least one tag');
        return;
      }

      await onSubmit({
        title: values.title,
        content,
        tags: values.tags,
        featuredImage,
      }, published);
    } catch (error: any) {
      if (error.errorFields) {
        message.error('Please fix the form errors');
      }
    }
  };

  return (
    <div className="space-y-6">
      <Form
        form={form}
        layout="vertical"
        className="space-y-6"
        initialValues={initialData}
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
            modules={QUILL_MODULES}
            placeholder="Write your story..."
            className="min-h-100"
          />
        </div>

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
              {tags.map(tag => (
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

      {mode === 'create' && (
        <div className="flex justify-end gap-3">
          <Button onClick={() => handleSubmit(false)} disabled={isLoading}>
            Save Draft
          </Button>
          <Button
            type="primary"
            onClick={() => handleSubmit(true)}
            loading={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            Publish
          </Button>
        </div>
      )}

      {mode === 'edit' && (
        <div className="flex justify-end">
          <Button
            type="primary"
            onClick={() => handleSubmit(true)}
            loading={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            Update
          </Button>
        </div>
      )}
    </div>
  );
}
