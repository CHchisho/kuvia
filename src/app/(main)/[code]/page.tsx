'use client';

import React, {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useAuthMe} from '@/hooks/useAuthMe';
import {useMediaComments} from '@/hooks/useMediaComments';
import {useMediaVotes, type VoteType} from '@/hooks/useMediaVotes';
import {useMediaMetadata} from '@/hooks/useMediaMetadata';
import {formatCO2, formatSavedBytes} from '@/lib/environmentMetrics';

interface PhotoPageProps {
  params: Promise<{code: string}>;
}

function canDelete(
  userId: number | undefined,
  role: string | undefined,
  authorId: number
): boolean {
  if (!userId) return false;
  if (userId === authorId) return true;
  return role === 'admin' || role === 'moderator';
}

export default function PhotoPage({params}: PhotoPageProps) {
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const {user} = useAuthMe();
  const {metadata, loading: loadingMeta, error: metaError} = useMediaMetadata(code);
  const {
    votes,
    loading: loadingVotes,
    submitting: submittingVote,
    vote,
  } = useMediaVotes(code);
  const {
    comments,
    loading: loadingComments,
    submitting: submittingComment,
    addComment,
  } = useMediaComments(code);

  React.useEffect(() => {
    params.then((p) => setCode(p.code));
  }, [params]);

  const handleVote = async (type: VoteType) => {
    if (!user) return;
    await vote(type);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const result = await addComment(commentText);
    if (result.success) setCommentText('');
  };

  const showDelete =
    user &&
    metadata &&
    canDelete(user.id, user.role, metadata.authorId);

  const handleDelete = async () => {
    if (!code || !showDelete || deleting) return;
    if (!confirm('Delete this photo? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/images/${code}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        router.push('/');
        router.refresh();
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch {
      alert('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  if (code === null) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <p className="text-mono-200">Loading…</p>
      </div>
    );
  }

  if (metaError && !error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-block mb-6 text-mono-200 hover:text-primary-100 transition-colors"
        >
          ← Back to Gallery
        </Link>
        <div className="rounded-lg border border-mono-300 bg-mono-400 p-8 text-center">
          <p className="text-mono-100 font-medium mb-2">Photo not found or expired</p>
          <Link href="/" className="text-primary-100 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = `/api/images/${code}`;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="text-mono-200 hover:text-primary-100 transition-colors"
        >
          ← Back to Gallery
        </Link>
        {showDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 rounded border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete photo'}
          </button>
        )}
      </div>

      {error ? (
        <div className="rounded-lg border border-mono-300 bg-mono-400 p-8 text-center">
          <p className="text-mono-100 font-medium mb-2">
            Link is invalid or expired
          </p>
          <p className="text-mono-300 text-sm mb-4">
            Photo is deleted or storage time has expired.
          </p>
          <Link href="/" className="text-primary-100 hover:underline">
            Back to Home
          </Link>
        </div>
      ) : (
        <>
          <div className="relative border border-mono-300 rounded-lg overflow-hidden bg-mono-500 flex items-center justify-center min-h-[60vh] mb-6">
            <img
              src={imageUrl}
              alt="Photo"
              className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
              onError={() => setError(true)}
            />
          </div>

          {/* Metadata */}
          {loadingMeta ? (
            <p className="text-mono-300 text-sm mb-4">Loading info…</p>
          ) : metadata && (
            <div className="mb-6 p-4 border border-mono-300 rounded-lg bg-mono-400 text-sm text-mono-200">
              <div className="grid gap-2">
                <p>
                  <span className="text-mono-300">Author:</span>{' '}
                  <span className="text-mono-100">{metadata.authorUsername}</span>
                </p>
                <p>
                  <span className="text-mono-300">Visibility:</span>{' '}
                  {metadata.isPrivate ? 'Private' : 'Public'}
                </p>
                <p>
                  <span className="text-mono-300">Uploaded:</span>{' '}
                  {new Date(metadata.createdAt).toLocaleString()}
                </p>
                <p>
                  <span className="text-mono-300">Expires:</span>{' '}
                  {new Date(metadata.expiresAt).toLocaleString()}
                </p>
                {metadata.description && (
                  <p>
                    <span className="text-mono-300">Description:</span>{' '}
                    <span className="text-mono-100">{metadata.description}</span>
                  </p>
                )}
                <p>
                  <span className="text-mono-300">Type:</span> {metadata.mimeType}
                </p>
                {(metadata.savedBytes > 0 || metadata.savedCO2Grams > 0) && (
                  <p>
                    <span className="text-mono-300">Saved:</span>{' '}
                    <span className="text-mono-100">
                      {formatSavedBytes(metadata.savedBytes)} data · {formatCO2(metadata.savedCO2Grams)} CO₂
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Rating section */}
          <div className="mb-6 p-4 border border-mono-300 rounded-lg bg-mono-400">
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <button
                    onClick={() => handleVote('upvote')}
                    disabled={submittingVote}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                      votes.userVote === 'upvote'
                        ? 'bg-primary-100 text-mono-500'
                        : 'bg-mono-300 text-mono-100 hover:bg-mono-200'
                    } ${submittingVote ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span>▲</span>
                    <span>{loadingVotes ? '...' : votes.upvotes}</span>
                  </button>
                  <div className="text-mono-100 font-semibold text-lg">
                    {loadingVotes ? '...' : votes.rating}
                  </div>
                  <button
                    onClick={() => handleVote('downvote')}
                    disabled={submittingVote}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                      votes.userVote === 'downvote'
                        ? 'bg-primary-100 text-mono-500'
                        : 'bg-mono-300 text-mono-100 hover:bg-mono-200'
                    } ${submittingVote ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span>▼</span>
                    <span>
                      {loadingVotes ? '...' : votes.downvotes}
                    </span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="text-mono-200 text-sm">
                    ▲ {loadingVotes ? '...' : votes.upvotes}
                  </div>
                  <div className="text-mono-100 font-semibold text-lg">
                    {loadingVotes ? '...' : votes.rating}
                  </div>
                  <div className="text-mono-200 text-sm">
                    ▼ {loadingVotes ? '...' : votes.downvotes}
                  </div>
                  <Link
                    href="/login"
                    className="ml-4 text-primary-100 hover:underline text-sm"
                  >
                    Login to vote
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Comments section */}
          <div className="border border-mono-300 rounded-lg bg-mono-400 p-4">
            <h2 className="text-xl font-bold text-mono-100 mb-4">Comments</h2>

            {user && (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-3 rounded bg-mono-500 text-mono-100 border border-mono-300 focus:outline-none focus:border-primary-100 mb-2"
                  rows={3}
                  disabled={submittingComment}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || submittingComment}
                  className="px-4 py-2 bg-primary-100 text-mono-500 rounded hover:bg-primary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingComment ? 'Sending...' : 'Send'}
                </button>
              </form>
            )}

            {!user && (
              <p className="text-mono-200 text-sm mb-4">
                <Link
                  href="/login"
                  className="text-primary-100 hover:underline"
                >
                  Login
                </Link>{' '}
                to leave a comment
              </p>
            )}

            {loadingComments ? (
              <p className="text-mono-200">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-mono-200">No comments yet</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border-b border-mono-300 pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-mono-100">
                        {comment.username}
                      </span>
                      <span className="text-xs text-mono-300">
                        {new Date(comment.createdAt).toLocaleString('en-US')}
                      </span>
                    </div>
                    <p className="text-mono-200">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
