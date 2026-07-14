import { Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import Navbar from './components/common/navbar.jsx';
import Home from './pages/home.jsx';
import Login from './pages/login.jsx';
import Signup from './pages/signup.jsx';
import PostList from './pages/post-list.jsx';
import PostDetail from './pages/post-detail.jsx';
import PostWrite from './pages/post-write.jsx';
import MyPage from './pages/my-page.jsx';

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/posts" element={<PostList />} />
          <Route path="/posts/new" element={<PostWrite />} />
          <Route path="/posts/:postId" element={<PostDetail />} />
          <Route path="/posts/:postId/edit" element={<PostWrite />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
