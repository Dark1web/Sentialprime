import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LoginPage from '../LoginPage';

// Mock the authentication helpers
jest.mock('../../../config/supabase', () => ({
  authHelpers: {
    signIn: jest.fn(),
    signUp: jest.fn(),
    getSession: jest.fn()
  }
}));

describe('LoginPage', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    
    expect(screen.getByText('SentinelX')).toBeInTheDocument();
    expect(screen.getByText('AI-Powered Disaster Intelligence System')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('shows validation error for empty fields', async () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    await userEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
    });
  });

  test('switches between login and register tabs', async () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    
    const registerTab = screen.getByRole('tab', { name: /register/i });
    await userEvent.click(registerTab);
    
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  test('demo login button works', async () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    
    const demoButton = screen.getByRole('button', { name: /demo login/i });
    await userEvent.click(demoButton);
    
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });

  test('Google login button is present', () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    
    const googleButton = screen.getByRole('button', { name: /google/i });
    expect(googleButton).toBeInTheDocument();
  });

  test('Apple ID login button is present', () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    
    const appleButton = screen.getByRole('button', { name: /apple id/i });
    expect(appleButton).toBeInTheDocument();
  });

  test('displays demo login instructions', () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    
    expect(screen.getByText('Demo Login Options:')).toBeInTheDocument();
    expect(screen.getByText(/demo@sentinelx.com/)).toBeInTheDocument();
    expect(screen.getByText(/admin@sentinelx.com/)).toBeInTheDocument();
  });

  test('password visibility toggle works', async () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
    
    expect(passwordInput.type).toBe('password');
    
    await userEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    
    await userEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });
});