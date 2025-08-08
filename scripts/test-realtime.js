#!/usr/bin/env node

/**
 * Real-time Data Test Script
 * 
 * This script demonstrates the real-time functionality by broadcasting
 * test data to the dashboard via SSE and WebSocket endpoints.
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:9000';

// Test data for different scenarios
const testData = {
  disasters: [
    {
      id: 'test-disaster-1',
      type: 'flood',
      title: 'Flash Flood Alert',
      description: 'Heavy rainfall causing flash floods in downtown area',
      severity: 'critical',
      latitude: 40.7128,
      longitude: -74.0060,
      address: 'Downtown Manhattan, NY',
      affected_population: 5000,
      source: 'Emergency Services',
      timestamp: new Date().toISOString()
    },
    {
      id: 'test-disaster-2',
      type: 'wildfire',
      title: 'Wildfire Spreading',
      description: 'Wildfire spreading rapidly in forest area',
      severity: 'high',
      latitude: 34.0522,
      longitude: -118.2437,
      address: 'Los Angeles, CA',
      affected_population: 2000,
      source: 'Fire Department',
      timestamp: new Date().toISOString()
    }
  ],
  
  alerts: [
    {
      id: 'test-alert-1',
      message: 'High misinformation activity detected in Region 7',
      type: 'warning',
      severity: 'medium',
      timestamp: new Date().toISOString()
    },
    {
      id: 'test-alert-2',
      message: 'Emergency triage queue exceeding capacity',
      type: 'critical',
      severity: 'high',
      timestamp: new Date().toISOString()
    }
  ],
  
  stats: {
    activeIncidents: 25,
    resolvedToday: 158,
    systemHealth: 99.2,
    responseTime: '1.8s',
    usersOnline: 1289,
    regionsMonitored: 87
  }
};

// Function to broadcast data via SSE
async function broadcastViaSSE(channel, data) {
  try {
    const response = await fetch(`${BASE_URL}/api/realtime/sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel,
        data,
        event_type: 'test_broadcast'
      })
    });
    
    const result = await response.json();
    console.log(`✅ SSE Broadcast (${channel}):`, result.message);
    return result;
  } catch (error) {
    console.error(`❌ SSE Broadcast Error (${channel}):`, error.message);
  }
}

// Function to broadcast data via WebSocket
async function broadcastViaWebSocket(channel, data) {
  try {
    const response = await fetch(`${BASE_URL}/api/realtime/websocket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel,
        data,
        event_type: 'test_broadcast'
      })
    });
    
    const result = await response.json();
    console.log(`✅ WebSocket Broadcast (${channel}):`, result.message);
    return result;
  } catch (error) {
    console.error(`❌ WebSocket Broadcast Error (${channel}):`, error.message);
  }
}

// Function to get real-time stats
async function getRealtimeStats() {
  try {
    const response = await fetch(`${BASE_URL}/api/realtime/websocket?action=stats`);
    const result = await response.json();
    console.log('📊 Real-time Stats:', result.data);
    return result;
  } catch (error) {
    console.error('❌ Error fetching stats:', error.message);
  }
}

// Main test function
async function runRealtimeTest() {
  console.log('🚀 Starting Real-time Data Test...\n');
  
  // Test 1: Broadcast disaster data
  console.log('📡 Broadcasting disaster data...');
  await broadcastViaSSE('disasters', testData.disasters);
  await broadcastViaWebSocket('disasters', testData.disasters);
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Broadcast alerts
  console.log('\n📡 Broadcasting alert data...');
  await broadcastViaSSE('alerts', testData.alerts);
  await broadcastViaWebSocket('alerts', testData.alerts);
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 3: Broadcast stats
  console.log('\n📡 Broadcasting stats data...');
  await broadcastViaSSE('stats', testData.stats);
  await broadcastViaWebSocket('stats', testData.stats);
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 4: Get real-time stats
  console.log('\n📊 Fetching real-time stats...');
  await getRealtimeStats();
  
  console.log('\n✅ Real-time test completed!');
  console.log('🌐 Open your dashboard at http://localhost:3000/dashboard to see live updates');
}

// Run the test
if (require.main === module) {
  runRealtimeTest().catch(console.error);
}

module.exports = {
  broadcastViaSSE,
  broadcastViaWebSocket,
  getRealtimeStats,
  testData
};
