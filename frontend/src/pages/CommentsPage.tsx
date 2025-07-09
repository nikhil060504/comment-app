import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  deletedAt: string | null;
  user: { id: number; email: string };
  children: Comment[];
}

const API_URL = 'http://localhost:3000'; // Change if backend runs elsewhere

function CommentNode({ comment, token, onReply, onEdit, onDelete, onRestore }: {
  comment: Comment;
  token: string;
  onReply: (parentId: number, content: string) => void;
  onEdit: (id: number, content: string) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
}) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);

  return (
    <div style={{ marginLeft: 24, marginTop: 8, borderLeft: '1px solid #eee', paddingLeft: 8 }}>
      <div>
        <b>{comment.user.email}</b>:
        {editing ? (
          <>
            <input value={editContent} onChange={e => setEditContent(e.target.value)} />
            <button onClick={() => { onEdit(comment.id, editContent); setEditing(false); }}>Save</button>
            <button onClick={() => setEditing(false)}>Cancel</button>
          </>
        ) : (
          <span style={{ textDecoration: comment.deletedAt ? 'line-through' : undefined, color: comment.deletedAt ? '#888' : undefined }}>
            {comment.content}
          </span>
        )}
        <span style={{ marginLeft: 8, fontSize: 12, color: '#888' }}>{new Date(comment.createdAt).toLocaleString()}</span>
      </div>
      <div style={{ marginTop: 4, marginBottom: 4 }}>
        {!comment.deletedAt && !editing && (
          <>
            <button onClick={() => setReplying(r => !r)} style={{ marginRight: 4 }}>Reply</button>
            <button onClick={() => setEditing(true)} style={{ marginRight: 4 }}>Edit</button>
            <button onClick={() => onDelete(comment.id)} style={{ marginRight: 4 }}>Delete</button>
          </>
        )}
        {comment.deletedAt && (
          <button onClick={() => onRestore(comment.id)} style={{ marginRight: 4 }}>Restore</button>
        )}
      </div>
      {replying && (
        <div style={{ marginTop: 4 }}>
          <input value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder="Reply..." />
          <button onClick={() => { onReply(comment.id, replyContent); setReplyContent(''); setReplying(false); }}>Send</button>
          <button onClick={() => setReplying(false)}>Cancel</button>
        </div>
      )}
      {comment.children && comment.children.map(child => (
        <CommentNode key={child.id} comment={child} token={token} onReply={onReply} onEdit={onEdit} onDelete={onDelete} onRestore={onRestore} />
      ))}
    </div>
  );
}

const CommentsPage: React.FC<{ token: string }> = ({ token }) => {
  const [thread, setThread] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  // Fetch the root thread (id=1 for demo, or fetch list and pick one)
  useEffect(() => {
    const fetchThread = async () => {
      setLoading(true);
      setError('');
      try {
        // For demo, fetch thread for comment id 1 if exists
        const res = await axios.get(`${API_URL}/comments/1/thread`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setThread(res.data);
      } catch (err: any) {
        setError('No thread found. Create a root comment to start.');
        setThread(null);
      } finally {
        setLoading(false);
      }
    };
    fetchThread();
  }, [token]);

  const createRootComment = async () => {
    setError('');
    try {
      await axios.post(`${API_URL}/comments`, { content: newComment }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewComment('');
      window.location.reload();
    } catch (err: any) {
      setError('Failed to create comment');
    }
  };

  const handleReply = async (parentId: number, content: string) => {
    try {
      await axios.post(`${API_URL}/comments`, { content, parentId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.reload();
    } catch {}
  };
  const handleEdit = async (id: number, content: string) => {
    try {
      await axios.patch(`${API_URL}/comments/${id}`, { content }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.reload();
    } catch {}
  };
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.reload();
    } catch {}
  };
  const handleRestore = async (id: number) => {
    try {
      await axios.patch(`${API_URL}/comments/${id}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.reload();
    } catch {}
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <h2>Comments Thread</h2>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <div style={{ marginBottom: 16 }}>
        <input
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Write a root comment..."
          style={{ width: '80%', padding: 8 }}
        />
        <button onClick={createRootComment} style={{ padding: 8, marginLeft: 8 }}>Post</button>
      </div>
      {loading ? <div>Loading...</div> : thread ? (
        <CommentNode
          comment={thread}
          token={token}
          onReply={handleReply}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestore={handleRestore}
        />
      ) : <div>No comments yet.</div>}
    </div>
  );
};

export default CommentsPage; 