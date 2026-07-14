import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { supabase } from '../../lib/supabase';

/**
 * CategorySidebar 컴포넌트
 *
 * Props: 없음
 *
 * Example usage:
 * <CategorySidebar />
 */
export default function CategorySidebar() {
  const [categories, setCategories] = useState([]);
  const [searchParams] = useSearchParams();
  const activeCategoryId = searchParams.get('category');

  useEffect(() => {
    supabase
      .from('gh_categories')
      .select('*')
      .order('id')
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        게임 카테고리
      </Typography>
      <List dense disablePadding>
        <ListItemButton
          component={Link}
          to="/posts"
          selected={!activeCategoryId}
        >
          <ListItemText primary="전체" />
        </ListItemButton>
        {categories.map((category) => (
          <ListItemButton
            key={category.id}
            component={Link}
            to={`/posts?category=${category.id}`}
            selected={String(activeCategoryId) === String(category.id)}
          >
            <ListItemText primary={category.name} />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
}
