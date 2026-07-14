import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CategorySidebar from '../components/common/category-sidebar.jsx';
import RightSidebar from '../components/common/right-sidebar.jsx';
import PostCard from '../components/ui/post-card.jsx';
import { supabase } from '../lib/supabase';

const SORT_OPTIONS = [
  { value: 'like_count', label: '좋아요 순' },
  { value: 'view_count', label: '조회수 순' },
  { value: 'comment_count', label: '댓글 순' },
];

/**
 * Home 페이지
 *
 * Props: 없음
 */
export default function Home() {
  const [sort, setSort] = useState('like_count');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    supabase
      .from('gh_post_summary')
      .select('*')
      .order(sort, { ascending: false })
      .limit(6)
      .then(({ data }) => setPosts(data ?? []));
  }, [sort]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <CategorySidebar />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: 3,
              px: { xs: 3, md: 5 },
              py: { xs: 4, md: 6 },
              mb: 3,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.6rem', md: '2.2rem' } }}>
              GameHub에서 게임 이야기를 나눠보세요
            </Typography>
            <Typography sx={{ mt: 1, opacity: 0.85 }}>
              공략, 후기, 자유로운 소통까지 - PC/모바일/콘솔 게임 모두 환영합니다.
            </Typography>
          </Box>

          <Tabs value={sort} onChange={(_event, value) => setSort(value)} sx={{ mb: 2 }}>
            {SORT_OPTIONS.map((option) => (
              <Tab key={option.value} value={option.value} label={option.label} />
            ))}
          </Tabs>

          <Grid container spacing={2}>
            {posts.map((post) => (
              <Grid key={post.id} size={{ xs: 12, sm: 6 }}>
                <PostCard post={post} />
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <RightSidebar />
        </Grid>
      </Grid>
    </Container>
  );
}
