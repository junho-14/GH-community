import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import { supabase } from '../../lib/supabase';

/**
 * RightSidebar 컴포넌트
 *
 * Props: 없음
 *
 * Example usage:
 * <RightSidebar />
 */
export default function RightSidebar() {
  const [recentComments, setRecentComments] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    supabase
      .from('gh_comments')
      .select('id, content, post_id, gh_posts(title)')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => setRecentComments(data ?? []));

    supabase
      .from('gh_notices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => setNotices(data ?? []));
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          최근 댓글
        </Typography>
        <List dense disablePadding>
          {recentComments.map((comment) => (
            <ListItemButton
              key={comment.id}
              component={Link}
              to={`/posts/${comment.post_id}`}
            >
              <ListItemText
                primary={comment.content}
                secondary={comment.gh_posts?.title}
                slotProps={{
                  primary: { noWrap: true },
                  secondary: { noWrap: true },
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          공지사항
        </Typography>
        <List dense disablePadding>
          {notices.map((notice) => (
            <ListItemButton key={notice.id}>
              <ListItemText primary={notice.title} slotProps={{ primary: { noWrap: true } }} />
            </ListItemButton>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
