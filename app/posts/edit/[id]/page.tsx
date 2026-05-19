'use client';

import PostEditor from '@/components/posts/PostEditor';
import { useAppDispatch, useAppSelector } from '@/store/hooks/reduxHooks';
import { fetchPostById, fetchTags, updatePost } from '@/store/slices/postSlice';
import { getFullImageUrl } from '@/utils/imageUtils';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, message, Spin } from 'antd';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentPost, isLoading, tags: storeTags } = useAppSelector((state) => state.posts);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchTags());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (params.id) {
      dispatch(fetchPostById(params.id as string));
    }
  }, [dispatch, params.id]);

  useEffect(() => {
    if (currentPost && user && currentPost.authorId !== user.id) {
      message.error('You are not authorized to edit this post');
      router.push(`/posts/${params.id}`);
    }
  }, [currentPost, user, params.id, router]);

  const handleSubmit = async (data: any, _published: boolean) => {
    if (!data.content || data.content === '<p><br></p>') {
      message.warning('Please write some content');
      return;
    }

    if (!data.tags || data.tags.length === 0) {
      message.warning('Please select at least one tag');
      return;
    }

    let imageUrl = data.featuredImage;

    const updateData = {
      title: data.title,
      content: data.content,
      tagNames: data.tags,
      featuredImage: imageUrl,
    };

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

  if (!storeTags || storeTags.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Loading tags..." />
      </div>
    );
  }

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

  const initialData = {
    title: currentPost.title,
    content: currentPost.content,
    tags: postTags,
    featuredImage: currentPost.featuredImage ? getFullImageUrl(currentPost.featuredImage) : '',
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PostEditor
          tags={storeTags}
          initialData={initialData}
          isLoading={isLoading}
          mode="edit"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}