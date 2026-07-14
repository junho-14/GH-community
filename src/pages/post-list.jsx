import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CategorySidebar from '../components/common/category-sidebar.jsx';
import RightSidebar from '../components/common/right-sidebar.jsx';
import PostCard from '../components/ui/post-card.jsx';
import Pagination from '../components/ui/pagination.jsx';
import { supabase } from '../lib/supabase';

const PAGE_SIZE = 9;

const SORT_OPTIONS = [
  { value: 'created_at', label: '최신순' },
  { value: 'like_count', label: '인기순' },
  { value: 'view_count', label: '조회순' },
];

/**
 * PostList 페이지
 *
 * Props: 없음
 */
export default function PostList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const initialSearch = searchParams.get('search') ?? '';
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [sort, setSort] = useState('created_at');
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setSearchInput(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    let query = supabase.from('gh_post_summary').select('*', { count: 'exact' });

    if (categoryId) query = query.eq('category_id', categoryId);
    if (initialSearch) query = query.ilike('title', `%${initialSearch}%`);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    query
      .order(sort, { ascending: false })
      .range(from, to)
      .then(({ data, count }) => {
        setPosts(data ?? []);
        setTotalCount(count ?? 0);
      });
  }, [categoryId, initialSearch, sort, page]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (searchInput) next.set('search', searchInput);
      else next.delete('search');
      return next;
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <CategorySidebar />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              mb: 2,
            }}
          >
            <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="제목으로 검색"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
              <Button type="submit" variant="contained">
                검색
              </Button>
            </Box>

            <TextField
              select
              size="small"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
              sx={{ minWidth: 140 }}
            >
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {posts.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              게시글이 없습니다.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {posts.map((post) => (
                <Grid key={post.id} size={{ xs: 12, sm: 6 }}>
                  <PostCard post={post} />
                </Grid>
              ))}
            </Grid>
          )}

          <Pagination
            page={page}
            count={Math.ceil(totalCount / PAGE_SIZE)}
            onChange={setPage}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button component={Link} to="/posts/new" variant="contained" color="secondary">
              글쓰기
            </Button>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <RightSidebar />
        </Grid>
      </Grid>
    </Container>
  );
}
