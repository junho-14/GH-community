import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

/**
 * LikeButton 컴포넌트
 *
 * Props:
 * @param {boolean} isActive - 현재 사용자가 눌렀는지 여부 [Optional, 기본값: false]
 * @param {number} count - 카운트 수치 [Required]
 * @param {node} icon - 표시할 아이콘 엘리먼트 [Required]
 * @param {function} onClick - 클릭 시 실행할 함수 [Required]
 * @param {string} color - 활성화 시 색상 [Optional, 기본값: primary]
 *
 * Example usage:
 * <LikeButton isActive count={3} icon={<ThumbUpIcon />} onClick={handleLike} />
 */
export default function LikeButton({ isActive = false, count, icon, onClick, color = 'primary' }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <IconButton onClick={onClick} color={isActive ? color : 'default'} size="small">
        {icon}
      </IconButton>
      <Typography variant="body2">{count}</Typography>
    </Box>
  );
}
