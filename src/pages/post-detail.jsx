import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareIcon from '@mui/icons-material/Share';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LikeButton from '../components/ui/like-button.jsx';
import CommentItem from '../components/ui/comment-item.jsx';
import { formatDate } from '../utils/format-date';
import { useAuth } from '../hooks/useAuth.jsx';
import { supabase } from '../lib/supabase';

function buildCommentTree(flatComments) {
  const byId = new Map(flatComments.map((comment) => [comment.id, { ...comment, children: [] }]));
  const roots = [];

  byId.forEach((comment) => {
    if (comment.parent_id && byId.has(comment.parent_id)) {
      byId.get(comment.parent_id).children.push(comment);
    } else {
      roots.push(comment);
    }
  });

  return roots;
}

/**
 * PostDetail 페이지
 *
 * Props: 없음
 */
export default function PostDetail() {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [postLikes, setPostLikes] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const loadPost = useCallback(() => {
    supabase
      .from('gh_post_summary')
      .select('*')
      .eq('id', postId)
      .single()
      .then(({ data }) => setPost(data));
  }, [postId]);

  const loadComments = useCallback(() => {
    supabase
      .from('gh_comments')
      .select('*, gh_users(nickname, profile_image_url), gh_comment_likes(user_id)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        const withCounts = (data ?? []).map((comment) => ({
          ...comment,
          like_count: comment.gh_comment_likes?.length ?? 0,
          liked: user ? comment.gh_comment_likes?.some((like) => like.user_id === user.id) : false,
        }));
        setComments(buildCommentTree(withCounts));
      });
  }, [postId, user]);

  const loadPostLikes = useCallback(() => {
    supabase
      .from('gh_post_likes')
      .select('*')
      .eq('post_id', postId)
      .then(({ data }) => setPostLikes(data ?? []));
  }, [postId]);

  useEffect(() => {
    loadPost();
    loadComments();
    loadPostLikes();
    supabase.rpc('gh_increment_post_view', { post_id_input: postId }).then(() => {});
  }, [loadPost, loadComments, loadPostLikes, postId]);

  useEffect(() => {
    if (!user) {
      setIsBookmarked(false);
      return;
    }
    supabase
      .from('gh_bookmarks')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setIsBookmarked(Boolean(data)));
  }, [postId, user]);

  if (!post) return null;

  const isOwner = user && user.id === post.user_id;
  const likeCount = postLikes.filter((like) => like.type === 'like').length;
  const dislikeCount = postLikes.filter((like) => like.type === 'dislike').length;
  const myReaction = postLikes.find((like) => like.user_id === user?.id)?.type ?? null;

  const requireLogin = () => {
    if (!user) {
      navigate('/login');
      return true;
    }
    return false;
  };

  const toggleReaction = async (type) => {
    if (requireLogin()) return;

    if (myReaction === type) {
      await supabase.from('gh_post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase
        .from('gh_post_likes')
        .upsert({ post_id: postId, user_id: user.id, type }, { onConflict: 'user_id,post_id' });
    }
    loadPostLikes();
  };

  const toggleBookmark = async () => {
    if (requireLogin()) return;

    if (isBookmarked) {
      await supabase.from('gh_bookmarks').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('gh_bookmarks').insert({ post_id: postId, user_id: user.id });
    }
    setIsBookmarked((prev) => !prev);
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    window.alert('링크가 복사되었습니다.');
  };

  const handleDeletePost = async () => {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) return;
    await supabase.from('gh_posts').delete().eq('id', postId);
    navigate('/posts');
  };

  const handleAddComment = async () => {
    if (requireLogin() || !newComment.trim()) return;
    await supabase.from('gh_comments').insert({
      post_id: postId,
      user_id: user.id,
      content: newComment.trim(),
    });
    setNewComment('');
    loadComments();
  };

  const handleReply = async (parentId, content) => {
    if (requireLogin()) return;
    await supabase.from('gh_comments').insert({
      post_id: postId,
      user_id: user.id,
      parent_id: parentId,
      content,
    });
    loadComments();
  };

  const handleEditComment = async (commentId, content) => {
    await supabase.from('gh_comments').update({ content }).eq('id', commentId);
    loadComments();
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    await supabase.from('gh_comments').delete().eq('id', commentId);
    loadComments();
  };

  const handleToggleCommentLike = async (commentId) => {
    if (requireLogin()) return;
    const comment = comments.flatMap((root) => [root, ...root.children]).find((item) => item.id === commentId);
    if (comment?.liked) {
      await supabase.from('gh_comment_likes').delete().eq('comment_id', commentId).eq('user_id', user.id);
    } else {
      await supabase.from('gh_comment_likes').insert({ comment_id: commentId, user_id: user.id });
    }
    loadComments();
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Chip label={post.category_name} size="small" color="secondary" sx={{ mb: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {post.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, color: 'text.secondary' }}>
          <Avatar src={post.author_profile_image_url} sx={{ width: 24, height: 24 }}>
            {post.author_nickname?.[0]}
          </Avatar>
          <Typography variant="body2">{post.author_nickname}</Typography>
          <Typography variant="body2">· {formatDate(post.created_at)}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, ml: 1 }}>
            <VisibilityIcon fontSize="inherit" />
            <Typography variant="body2">{post.view_count}</Typography>
          </Box>
        </Box>

        {post.thumbnail_url && (
          <Box
            component="img"
            src={post.thumbnail_url}
            alt={post.title}
            sx={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 2, my: 2 }}
          />
        )}

        <Typography sx={{ whiteSpace: 'pre-wrap', mt: 2 }}>{post.content}</Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <LikeButton
            isActive={myReaction === 'like'}
            count={likeCount}
            icon={myReaction === 'like' ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
            onClick={() => toggleReaction('like')}
          />
          <LikeButton
            isActive={myReaction === 'dislike'}
            count={dislikeCount}
            color="error"
            icon={myReaction === 'dislike' ? <ThumbDownIcon /> : <ThumbDownOutlinedIcon />}
            onClick={() => toggleReaction('dislike')}
          />
          <LikeButton
            isActive={isBookmarked}
            count=""
            icon={isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            onClick={toggleBookmark}
          />
          <Button startIcon={<ShareIcon />} onClick={handleShare}>
            공유하기
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          {isOwner && (
            <>
              <Button component={Link} to={`/posts/${postId}/edit`}>
                수정
              </Button>
              <Button color="error" onClick={handleDeletePost}>
                삭제
              </Button>
            </>
          )}
          <Button component={Link} to="/posts">
            목록으로
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: { xs: 3, md: 4 }, mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          댓글 {comments.reduce((sum, root) => sum + 1 + root.children.length, 0)}개
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={user ? '댓글을 입력하세요' : '로그인 후 댓글을 작성할 수 있습니다'}
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
          />
          <Button variant="contained" onClick={handleAddComment}>
            등록
          </Button>
        </Box>

        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={user?.id}
            onReply={handleReply}
            onEdit={handleEditComment}
            onDelete={handleDeleteComment}
            onToggleLike={handleToggleCommentLike}
          />
        ))}
      </Paper>
    </Container>
  );
}
