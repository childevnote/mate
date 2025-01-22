import React, { useState } from 'react';
import { MessageCircle, ThumbsUp } from 'lucide-react';
import { Post, Comment } from '../data/dummyData';
import { Button } from "@/components/ui/button"

interface PostItemProps {
  post: Post;
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-2">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">{comment.author}</span>
        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {comment.university}
        </span>
      </div>
      <p className="text-gray-600 dark:text-gray-300">{comment.content}</p>
      <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
        <ThumbsUp size={14} className="mr-1" />
        <span>{comment.likes}</span>
      </div>
    </div>
  );
}

export function PostItem({ post }: PostItemProps) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-green-700">
      <span className='flex text-xs text-gray-500 dark:text-gray-400 pb-2'>
        {post.category}
      </span>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">{post.title}</h2>
        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {post.university}
        </span>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{post.content}</p>
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <ThumbsUp size={16} className="mr-1" />
            {post.likes}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center"
          >
            <MessageCircle size={16} className="mr-1" />
            {post.comments.length} 댓글
          </Button>
        </div>
        <span>{post.author}</span>
      </div>
      {showComments && (
        <div className="mt-4 space-y-2">
          {post.comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}

