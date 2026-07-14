import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import PostForm from '../components/post/post-form.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { supabase } from '../lib/supabase';

/**
 * PostWrite 페이지 (게시글 작성/수정 겸용)
 *
 * Props: 없음
 */
export default function PostWrite() {
  const { postId } = useParams();
  const isEditMode = Boolean(postId);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!isEditMode) return;
    supabase
      .from('gh_posts')
      .select('*')
      .eq('id', postId)
      .single()
      .then(({ data }) => setInitialValues(data));
  }, [isEditMode, postId]);

  const uploadThumbnail = async (file) => {
    const filePath = `posts/${user.id}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('gh-images').upload(filePath, file);
    if (uploadError) throw uploadError;
    return supabase.storage.from('gh-images').getPublicUrl(filePath).data.publicUrl;
  };

  const handleSubmit = async ({ title, content, categoryId, thumbnailFile }) => {
    setError('');
    setIsSubmitting(true);
    try {
      let thumbnailUrl = initialValues?.thumbnail_url ?? null;
      if (thumbnailFile) {
        thumbnailUrl = await uploadThumbnail(thumbnailFile);
      }

      if (isEditMode) {
        const { error: updateError } = await supabase
          .from('gh_posts')
          .update({
            title,
            content,
            category_id: categoryId,
            thumbnail_url: thumbnailUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', postId);
        if (updateError) throw updateError;
        navigate(`/posts/${postId}`);
      } else {
        const { data, error: insertError } = await supabase
          .from('gh_posts')
          .insert({
            title,
            content,
            category_id: categoryId,
            thumbnail_url: thumbnailUrl,
            user_id: user.id,
          })
          .select()
          .single();
        if (insertError) throw insertError;
        navigate(`/posts/${data.id}`);
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditMode && !initialValues) return null;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          {isEditMode ? '게시글 수정' : '게시글 작성'}
        </Typography>

        {error && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        <PostForm initialValues={initialValues} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </Paper>
    </Container>
  );
}
