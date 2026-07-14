import { useState } from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { formatDate } from '../../utils/format-date';
import LikeButton from './like-button.jsx';

/**
 * CommentItem 컴포넌트 (대댓글 재귀 렌더링)
 *
 * Props:
 * @param {object} comment - 댓글 데이터 (children 배열 포함) [Required]
 * @param {string} currentUserId - 현재 로그인한 사용자 id [Optional]
 * @param {function} onReply - 대댓글 작성 함수 (parentId, content) [Required]
 * @param {function} onEdit - 댓글 수정 함수 (commentId, content) [Required]
 * @param {function} onDelete - 댓글 삭제 함수 (commentId) [Required]
 * @param {function} onToggleLike - 댓글 좋아요 토글 함수 (commentId) [Required]
 * @param {number} depth - 들여쓰기 깊이 [Optional, 기본값: 0]
 *
 * Example usage:
 * <CommentItem comment={comment} onReply={handleReply} onEdit={handleEdit} onDelete={handleDelete} onToggleLike={handleToggleLike} />
 */
export default function CommentItem({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onToggleLike,
  depth = 0,
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const isOwner = currentUserId && currentUserId === comment.user_id;

  const submitReply = () => {
    if (!draft.trim()) return;
    onReply(comment.id, draft.trim());
    setDraft('');
    setIsReplying(false);
  };

  const submitEdit = () => {
    if (!draft.trim()) return;
    onEdit(comment.id, draft.trim());
    setIsEditing(false);
  };

  return (
    <Box sx={{ ml: { xs: depth * 2, md: depth * 4 }, mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Avatar src={comment.gh_users?.profile_image_url} sx={{ width: 32, height: 32 }}>
          {comment.gh_users?.nickname?.[0]}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {comment.gh_users?.nickname ?? '알수없음'}
            </Typography>
            {comment.is_best && <Chip label="베스트" size="small" color="secondary" />}
            <Typography variant="caption" color="text.secondary">
              {formatDate(comment.created_at)}
            </Typography>
          </Box>

          {isEditing ? (
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <TextField
                fullWidth
                size="small"
                defaultValue={comment.content}
                onChange={(event) => setDraft(event.target.value)}
              />
              <Button onClick={submitEdit}>저장</Button>
              <Button onClick={() => setIsEditing(false)}>취소</Button>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {comment.content}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <LikeButton
              isActive={comment.liked}
              count={comment.like_count ?? 0}
              icon={comment.liked ? <ThumbUpIcon fontSize="small" /> : <ThumbUpOutlinedIcon fontSize="small" />}
              onClick={() => onToggleLike(comment.id)}
            />
            <Button size="small" onClick={() => setIsReplying((prev) => !prev)}>
              답글
            </Button>
            {isOwner && (
              <>
                <Button
                  size="small"
                  onClick={() => {
                    setDraft(comment.content);
                    setIsEditing(true);
                  }}
                >
                  수정
                </Button>
                <Button size="small" color="error" onClick={() => onDelete(comment.id)}>
                  삭제
                </Button>
              </>
            )}
          </Box>

          {isReplying && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="답글을 입력하세요"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <Button variant="contained" onClick={submitReply}>
                등록
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {comment.children?.map((child) => (
        <CommentItem
          key={child.id}
          comment={child}
          currentUserId={currentUserId}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleLike={onToggleLike}
          depth={depth + 1}
        />
      ))}
    </Box>
  );
}
