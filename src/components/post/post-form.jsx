import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { supabase } from '../../lib/supabase';

/**
 * PostForm 컴포넌트 (게시글 작성/수정 공용)
 *
 * Props:
 * @param {object} initialValues - 초기값 (수정 시 전달) [Optional]
 * @param {function} onSubmit - 제출 함수 ({ title, content, categoryId, thumbnailFile }) [Required]
 * @param {boolean} isSubmitting - 제출 중 여부 [Optional, 기본값: false]
 *
 * Example usage:
 * <PostForm onSubmit={handleCreate} />
 */
export default function PostForm({ initialValues, onSubmit, isSubmitting = false }) {
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [content, setContent] = useState(initialValues?.content ?? '');
  const [categoryId, setCategoryId] = useState(initialValues?.category_id ?? '');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialValues?.thumbnail_url ?? null);

  useEffect(() => {
    supabase
      .from('gh_categories')
      .select('*')
      .order('id')
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ title, content, categoryId, thumbnailFile });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        select
        label="게임 카테고리"
        value={categoryId}
        onChange={(event) => setCategoryId(event.target.value)}
        required
      >
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {category.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="제목"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />

      <Stack direction="row" spacing={2} alignItems="center">
        {previewUrl && (
          <Avatar src={previewUrl} variant="rounded" sx={{ width: 80, height: 80 }} />
        )}
        <Button variant="outlined" component="label">
          대표 이미지 업로드
          <input type="file" accept="image/*" hidden onChange={handleFileChange} />
        </Button>
      </Stack>

      <TextField
        label="내용"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        required
        multiline
        minRows={10}
      />

      <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
        {isSubmitting ? '저장 중...' : '저장'}
      </Button>
    </Box>
  );
}
