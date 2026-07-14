import { Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import { formatDate } from '../../utils/format-date';

/**
 * PostCard 컴포넌트
 *
 * Props:
 * @param {object} post - 게시글 데이터 [Required]
 *
 * Example usage:
 * <PostCard post={post} />
 */
export default function PostCard({ post }) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea
        component={Link}
        to={`/posts/${post.id}`}
        sx={{ flexGrow: 1, alignItems: 'stretch', display: 'flex', flexDirection: 'column' }}
      >
        <CardMedia
          component="img"
          image={post.thumbnail_url || 'https://placehold.co/400x225?text=GameHub'}
          alt={post.title}
          sx={{ height: 160, objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Chip
            label={post.category_name ?? '기타'}
            size="small"
            color="secondary"
            sx={{ mb: 1 }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
            {post.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {post.author_nickname ?? '알수없음'} · {formatDate(post.created_at)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, mt: 1, color: 'text.secondary' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <VisibilityIcon fontSize="inherit" />
              <Typography variant="caption">{post.view_count ?? 0}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <ThumbUpOutlinedIcon fontSize="inherit" />
              <Typography variant="caption">{post.like_count ?? 0}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <ChatBubbleOutlineIcon fontSize="inherit" />
              <Typography variant="caption">{post.comment_count ?? 0}</Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
