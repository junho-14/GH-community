import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { useAuth } from '../../hooks/useAuth.jsx';

/**
 * Navbar 컴포넌트
 *
 * Props: 없음
 *
 * Example usage:
 * <Navbar />
 */
export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate(`/posts?search=${encodeURIComponent(keyword)}`);
  };

  const handleLogout = async () => {
    setAnchorEl(null);
    await signOut();
    navigate('/');
  };

  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Toolbar sx={{ gap: { xs: 1, md: 2 }, px: { xs: 2, md: 3 } }}>
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          <SportsEsportsIcon />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            GameHub
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'rgba(255,255,255,0.15)',
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
            ml: { xs: 1, md: 3 },
          }}
        >
          <SearchIcon fontSize="small" />
          <InputBase
            placeholder="검색어를 입력하세요"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            sx={{ color: 'inherit', ml: 1, flexGrow: 1, fontSize: { xs: '0.85rem', md: '1rem' } }}
          />
        </Box>

        {user ? (
          <>
            <IconButton onClick={(event) => setAnchorEl(event.currentTarget)}>
              <Avatar src={profile?.profile_image_url} sx={{ width: 32, height: 32 }}>
                {profile?.nickname?.[0]}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem
                component={Link}
                to="/mypage"
                onClick={() => setAnchorEl(null)}
              >
                마이페이지
              </MenuItem>
              <MenuItem
                component={Link}
                to="/posts/new"
                onClick={() => setAnchorEl(null)}
              >
                글쓰기
              </MenuItem>
              <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button component={Link} to="/login" color="inherit">
              로그인
            </Button>
            <Button
              component={Link}
              to="/signup"
              variant="outlined"
              color="inherit"
            >
              회원가입
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
