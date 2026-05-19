'use client';

import PostEditor from '@/components/posts/PostEditor';
import { postService } from '@/lib/api/posts';
import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import { createPost, fetchTags } from '@/store/slices/postSlice';
import { ArrowLeftOutlined, CameraOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Select, Spin, Upload, message } from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};

export default function CreatePostPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, tags: storeTags } = useAppSelector((state) => state.posts);
  const { user } = useAppSelector((state) => state.auth);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [tagError, setTagError] = useState('');

  
  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => { if (user) dispatch(fetchTags()); }, [dispatch, user]);
  useEffect(() => { if (storeTags?.length > 0) setAvailableTags(storeTags); }, [storeTags]);
  useEffect(() => {
    if (!user) { router.push('/login?redirect=/posts/create'); return; }
    if (user && !user.verified) { router.push('/verify-email'); return; }
  }, [user, router]);

  const validate = () => {
    let ok = true;
    if (!title || title.trim().length < 10) { setTitleError('Title must be at least 10 characters'); ok = false; }
    else setTitleError('');
    if (!content || content === '<p><br></p>') { message.warning('Please write some content'); ok = false; }
    if (selectedTags.length === 0) { setTagError('Please select at least one tag'); ok = false; }
    else setTagError('');
    return ok;
  };

  const buildPayload = (published: boolean) => {
    let imageUrl = featuredImage;
    if (imageUrl && !imageUrl.startsWith('http')) imageUrl = `http://localhost:8080${imageUrl}`;
    return { title, content, tagNames: selectedTags, featuredImage: imageUrl, published };
  };

  const handleSaveDraft = async () => {
    if (!content || content === '<p><br></p>') { message.warning('Please write some content'); return; }
    if (selectedTags.length === 0) { setTagError('Please select at least one tag'); return; }
    try {
      await dispatch(createPost(buildPayload(false))).unwrap();
      message.success('Saved as draft!');
      router.push('/feed');
    } catch (e: any) { message.error(e?.response?.data?.error || 'Failed to save draft'); }
  };

  const handlePublish = async () => {
    if (!validate()) return;
    try {
      await dispatch(createPost(buildPayload(true))).unwrap();
      message.success('Post published!');
      router.push('/feed');
    } catch (e: any) { message.error(e?.response?.data?.error || 'Failed to publish'); }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const data = await postService.uploadImage(file);
      let imageUrl = data.url;
      if (imageUrl && !imageUrl.startsWith('http')) imageUrl = `http://localhost:8080${imageUrl}`;
      setFeaturedImage(imageUrl);
      message.success('Image uploaded!');
    } catch { message.error('Failed to upload image'); }
    finally { setUploading(false); }
    return false;
  };

  if (!isMounted || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f4f0]">
      <LoadingOutlined className="text-4xl text-green-700" spin />
    </div>
  );

  if (availableTags.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f4f0]">
      <Spin indicator={<LoadingOutlined className="text-green-700" spin />} tip="Loading..." />
    </div>
  );

  const inputCls = 'w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e8e5df] outline-none focus:border-green-600 focus:ring-2 focus:ring-green-50 transition-all bg-white';

  return (
    <>
    <div className="min-h-screen bg-[#f5f4f0]">

      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-[#e8e5df]">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/feed" className="w-8 h-8 flex items-center justify-center rounded-lg text-[#7a7570] hover:bg-[#f5f4f0] hover:text-[#1a1917] transition-colors">
              <ArrowLeftOutlined />
            </Link>
            <h1 className="text-base font-semibold text-[#1a1917]" style={{ fontFamily: 'DM Serif Display, Georgia, serif' }}>
              Write a Story
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveDraft}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium border border-[#d4cfc5] bg-white text-[#1a1917] rounded-lg hover:bg-[#f5f4f0] disabled:opacity-50 transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={handlePublish}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-60 transition-colors"
            >
              {isLoading && <LoadingOutlined />}
              {isLoading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-5">

        {/* Title */}
        <div className="bg-white rounded-2xl border border-[#e8e5df] px-7 py-6">
          <label className="block text-xs font-medium text-[#7a7570] mb-2 uppercase tracking-wide">Title</label>
          <input
            value={title}
            onChange={e => { setTitle(e.target.value); setTitleError(''); }}
            placeholder="Give your story a compelling title..."
            className={`w-full text-2xl font-semibold text-[#1a1917] placeholder-[#c8c4bc] outline-none bg-transparent border-none resize-none`}
            style={{ fontFamily: 'DM Serif Display, Georgia, serif' }}
          />
          {titleError && <p className="text-xs text-red-500 mt-2">{titleError}</p>}
        </div>

        {/* Featured Image */}
        <div className="bg-white rounded-2xl border border-[#e8e5df] px-7 py-6">
          <label className="block text-xs font-medium text-[#7a7570] mb-4 uppercase tracking-wide">Featured Image</label>

          {featuredImage ? (
            <div className="relative group rounded-xl overflow-hidden border border-[#e8e5df]">
              <img src={featuredImage} alt="featured" className="w-full max-h-64 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload showUploadList={false} beforeUpload={handleImageUpload} accept="image/*"
                  customRequest={({ onSuccess }) => setTimeout(() => onSuccess?.('ok'), 0)}>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-medium text-[#1a1917]">
                    <CameraOutlined /> Change Image
                  </button>
                </Upload>
              </div>
            </div>
          ) : (
            <Upload
              showUploadList={false}
              beforeUpload={handleImageUpload}
              accept="image/*"
              customRequest={({ onSuccess }) => setTimeout(() => onSuccess?.('ok'), 0)}
            >
              <div className="flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed border-[#d4cfc5] rounded-xl cursor-pointer hover:border-green-600 hover:bg-green-50 transition-all">
                {uploading
                  ? <LoadingOutlined className="text-2xl text-green-700" spin />
                  : <PlusOutlined className="text-2xl text-[#7a7570]" />
                }
                <p className="text-sm text-[#7a7570]">{uploading ? 'Uploading...' : 'Click to upload a featured image'}</p>
              </div>
            </Upload>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-[#e8e5df] px-7 py-6">
          <label className="block text-xs font-medium text-[#7a7570] mb-4 uppercase tracking-wide">Content</label>
          <style>{`
            .ql-toolbar { border-radius: 10px 10px 0 0 !important; border-color: #e8e5df !important; background: #faf9f7; }
            .ql-container { border-radius: 0 0 10px 10px !important; border-color: #e8e5df !important; font-size: 15px; min-height: 280px; }
            .ql-editor { min-height: 260px; line-height: 1.75; color: #1a1917; }
            .ql-editor.ql-blank::before { color: #c8c4bc; font-style: normal; }
          `}</style>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            placeholder="Write your story here..."
          />
        </div>

        {/* Tags */}
        <div className="bg-white rounded-2xl border border-[#e8e5df] px-7 py-6">
          <label className="block text-xs font-medium text-[#7a7570] mb-1.5 uppercase tracking-wide">Tags</label>
          <p className="text-xs text-[#7a7570] mb-3">Add up to 5 tags to help readers find your story</p>
          <Select
            mode="multiple"
            placeholder="Select tags..."
            value={selectedTags}
            onChange={v => { setSelectedTags(v); setTagError(''); }}
            className="w-full"
            maxCount={5}
            style={{ width: '100%' }}
          >
            {availableTags.map(tag => (
              <Select.Option key={tag.id} value={tag.name}>{tag.name}</Select.Option>
            ))}
          </Select>
          {tagError && <p className="text-xs text-red-500 mt-1.5">{tagError}</p>}
        </div>

        {/* Bottom actions */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            onClick={handleSaveDraft}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-medium border border-[#d4cfc5] bg-white text-[#1a1917] rounded-lg hover:bg-[#f5f4f0] disabled:opacity-50 transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-60 transition-colors"
          >
            {isLoading && <LoadingOutlined />}
            {isLoading ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>

      </div>
    </div>
    </>
  );
}