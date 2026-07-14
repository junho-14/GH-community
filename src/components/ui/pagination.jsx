import Box from '@mui/material/Box';
import MuiPagination from '@mui/material/Pagination';

/**
 * Pagination 컴포넌트
 *
 * Props:
 * @param {number} page - 현재 페이지 번호 [Required]
 * @param {number} count - 전체 페이지 수 [Required]
 * @param {function} onChange - 페이지 변경 시 실행할 함수 [Required]
 *
 * Example usage:
 * <Pagination page={page} count={count} onChange={setPage} />
 */
export default function Pagination({ page, count, onChange }) {
  if (count <= 1) return null;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 3, md: 4 } }}>
      <MuiPagination
        page={page}
        count={count}
        color="primary"
        onChange={(_event, value) => onChange(value)}
      />
    </Box>
  );
}
