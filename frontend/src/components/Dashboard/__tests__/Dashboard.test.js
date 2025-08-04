import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Dashboard from '../Dashboard';

// Mock the components
jest.mock('../components/AlertsOverview', () => {
  return function MockAlertsOverview() {
    return <div data-testid="alerts-overview">Alerts Overview</div>;
  };
});

jest.mock('../components/RealTimeMap', () => {
  return function MockRealTimeMap() {
    return <div data-testid="real-time-map">Real Time Map</div>;
  };
});

jest.mock('../components/TrendChart', () => {
  return function MockTrendChart() {
    return <div data-testid="trend-chart">Trend Chart</div>;
  };
});

jest.mock('../components/SystemMetrics', () => {
  return function MockSystemMetrics() {
    return <div data-testid="system-metrics">System Metrics</div>;
  };
});

jest.mock('../components/TriageQueue', () => {
  return function MockTriageQueue() {
    return <div data-testid="triage-queue">Triage Queue</div>;
  };
});

jest.mock('../components/MisinformationFeed', () => {
  return function MockMisinformationFeed() {
    return <div data-testid="misinformation-feed">Misinformation Feed</div>;
  };
});

jest.mock('../components/NetworkStatus', () => {
  return function MockNetworkStatus() {
    return <div data-testid="network-status">Network Status</div>;
  };
});

const MockedDashboard = () => (
  <BrowserRouter>
    <Dashboard />
  </BrowserRouter>
);

describe('Dashboard', () => {
  test('renders dashboard with all key components', async () => {
    render(<MockedDashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('alerts-overview')).toBeInTheDocument();
      expect(screen.getByTestId('real-time-map')).toBeInTheDocument();
      expect(screen.getByTestId('trend-chart')).toBeInTheDocument();
      expect(screen.getByTestId('system-metrics')).toBeInTheDocument();
      expect(screen.getByTestId('triage-queue')).toBeInTheDocument();
      expect(screen.getByTestId('misinformation-feed')).toBeInTheDocument();
      expect(screen.getByTestId('network-status')).toBeInTheDocument();
    });
  });

  test('dashboard loads without crashing', () => {
    render(<MockedDashboard />);
    // If we get here without throwing, the component loaded successfully
    expect(true).toBe(true);
  });
});