import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Globe from './Globe';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <Box sx={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000',
      color: '#fff',
      position: 'relative',
    }}>
      <Canvas style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <Suspense fallback={<CircularProgress />}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />
          <Globe />
          <OrbitControls enableZoom={false} />
        </Suspense>
      </Canvas>
      <Box sx={{ zIndex: 1, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom className="fade-in">
          SentinelX
        </Typography>
        <Typography variant="h5" component="p" gutterBottom className="fade-in">
          Your Eye on Global Disasters
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/dashboard"
            className="fade-in"
          >
            Enter Dashboard
          </Button>
          <Button
            variant="outlined"
            color="primary"
            component={Link}
            to="/login"
            className="fade-in"
          >
            Login
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LandingPage;