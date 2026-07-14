import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import { useAuth } from '../hooks/useAuth.jsx';
import { supabase } from '../lib/supabase';
import PostCard from '../components/ui/post-card.jsx';
import { formatDate } from '../utils/format-date';

const TABS = [
  { value: 'posts', label: '내가 작성한 게시글' },
  { value: 'comments', label: '내가 작성한 댓글' },
  { value: 'liked', label: '좋아요한 게시글' },
  { value: 'bookmarks', label: '북마크 목록' },
];

/**
 * MyPage 페이지
 *
 * Props: 없음
 */
export default function MyPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    if (tab === 'posts') {
      supabase
        .from('gh_post_summary')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => setPosts(data ?? []));
    } else if (tab === 'comments') {
      supabase
        .from('gh_comments')
        .select('*, gh_posts(title)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => setComments(data ?? []));
    } else if (tab === 'liked') {
      supabase
        .from('gh_post_likes')
        .select('gh_post_summary(*)')
        .eq('user_id', user.id)
        .eq('type', 'like')
        .then(({ data }) => setPosts((data ?? []).map((row) => row.gh_post_summary).filter(Boolean)));
    } else if (tab === 'bookmarks') {
      supabase
        .from('gh_bookmarks')
        .select('gh_post_summary(*)')
        .eq('user_id', user.id)
        .then(({ data }) => setPosts((data ?? []).map((row) => row.gh_post_summary).filter(Boolean)));
    }
  }, [tab, user]);

  if (!user) return null;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar src={profile?.profile_image_url} sx={{ width: 64, height: 64 }}>
          {profile?.nickname?.[0]}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {profile?.nickname}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
      </Paper>

      <Tabs
        value={tab}
        onChange={(_event, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        {TABS.map((item) => (
          <Tab key={item.value} value={item.value} label={item.label} />
        ))}
      </Tabs>

      {tab === 'comments' ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {comments.map((comment) => (
            <Paper key={comment.id} sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {comment.gh_posts?.title} · {formatDate(comment.created_at)}
              </Typography>
              <Typography sx={{ mt: 0.5 }}>{comment.content}</Typography>
            </Paper>
          ))}
          {comments.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              작성한 댓글이 없습니다.
            </Typography>
          )}
        </Box>
      ) : (
        <Grid container spacing={2}>
          {posts.map((post) => (
            <Grid key={post.id} size={{ xs: 12, sm: 6 }}>
              <PostCard post={post} />
            </Grid>
          ))}
          {posts.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                표시할 게시글이 없습니다.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
}
