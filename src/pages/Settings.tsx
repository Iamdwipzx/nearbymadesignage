import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Settings = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Since we're using a mock auth system, we'll just simulate saving
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    // Simulate API call
    setTimeout(() => {
      setSuccess('Profile updated successfully');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>
      
      <Card title="Profile Information" subtitle="Update your account profile information">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
          
          <div className="mb-4">
            <Input
              label="Name"
              type="text"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <Input
              label="Email Address"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled
              helperText="Email cannot be changed"
            />
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
      
      <Card title="Password" subtitle="Update your password">
        <form>
          <div className="mb-4">
            <Input
              label="Current Password"
              type="password"
              fullWidth
              required
            />
          </div>
          
          <div className="mb-4">
            <Input
              label="New Password"
              type="password"
              fullWidth
              required
              helperText="Password must be at least 8 characters"
            />
          </div>
          
          <div className="mb-4">
            <Input
              label="Confirm New Password"
              type="password"
              fullWidth
              required
            />
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>
      
      <Card title="App Preferences" subtitle="Customize your app experience">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Theme</h3>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                id="theme-light"
                name="theme"
                type="radio"
                checked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="theme-light" className="ml-2 block text-sm font-medium text-gray-700">
                Light
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="theme-dark"
                name="theme"
                type="radio"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                disabled
              />
              <label htmlFor="theme-dark" className="ml-2 block text-sm font-medium text-gray-500">
                Dark (Coming Soon)
              </label>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Email Notifications</h3>
              <p className="text-sm text-gray-500">Receive emails about playlist updates and screen status</p>
            </div>
            <div className="flex items-center">
              <input
                id="email-notifications"
                name="email-notifications"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
            variant="primary"
            disabled
          >
            Save Preferences
          </Button>
        </div>
      </Card>
      
      <Card title="Danger Zone" className="border-red-200">
        <div className="text-sm text-gray-500 mb-4">
          <p>Once you delete your account, all of your data will be permanently removed.</p>
          <p>This action cannot be undone.</p>
        </div>
        
        <div className="flex justify-end">
          <Button
            variant="danger"
            disabled={user?.email === 'admin@example.com'} // Prevent deleting demo account
          >
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;