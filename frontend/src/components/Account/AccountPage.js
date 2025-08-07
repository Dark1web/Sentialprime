import React from 'react';
import { Box, Typography, Button, TextField, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const AccountPage = () => {
  const { user, signOut } = useAuth();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Account
      </Typography>
      <Typography variant="h6" gutterBottom>
        Welcome, {user.email}
      </Typography>
      <Button variant="contained" onClick={signOut}>
        Sign Out
      </Button>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Alert Preferences
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox defaultChecked />}
            label="Flood Alerts"
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Earthquake Alerts"
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Tornado Alerts"
          />
        </FormGroup>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Report Generation
        </Typography>
        <Button variant="contained">
          Download PDF Report
        </Button>
        <Button variant="contained" sx={{ ml: 2 }}>
          Download CSV Report
        </Button>
      </Box>
    </Box>
  );
};

export default AccountPage;