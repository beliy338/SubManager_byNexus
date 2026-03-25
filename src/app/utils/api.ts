import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-076c1030`;

export const api = {
  async signup(email: string, password: string, name: string) {
    try {
      console.log('Sending signup request to server...');
      const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password, name })
      });
      
      console.log('Signup response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Signup error from server:', error);
        throw new Error(error.error || 'Signup failed');
      }
      
      const result = await response.json();
      console.log('Signup successful');
      return result;
    } catch (error) {
      console.error('Signup request failed:', error);
      throw error;
    }
  },

  async getSubscriptions(accessToken: string) {
    try {
      const response = await fetch(`${API_BASE}/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Error fetching subscriptions:', error);
        throw new Error(error.error || 'Failed to fetch subscriptions');
      }
      
      return response.json();
    } catch (error) {
      console.error('Get subscriptions request failed:', error);
      throw error;
    }
  },

  async addSubscription(accessToken: string, subscription: any) {
    try {
      const response = await fetch(`${API_BASE}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(subscription)
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Error adding subscription:', error);
        throw new Error(error.error || 'Failed to add subscription');
      }
      
      return response.json();
    } catch (error) {
      console.error('Add subscription request failed:', error);
      throw error;
    }
  },

  async updateSubscription(accessToken: string, id: string, updates: any) {
    try {
      const response = await fetch(`${API_BASE}/subscriptions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Error updating subscription:', error);
        throw new Error(error.error || 'Failed to update subscription');
      }
      
      return response.json();
    } catch (error) {
      console.error('Update subscription request failed:', error);
      throw error;
    }
  },

  async deleteSubscription(accessToken: string, id: string) {
    try {
      const response = await fetch(`${API_BASE}/subscriptions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Error deleting subscription:', error);
        throw new Error(error.error || 'Failed to delete subscription');
      }
      
      return response.json();
    } catch (error) {
      console.error('Delete subscription request failed:', error);
      throw error;
    }
  },

  async getSettings(accessToken: string) {
    try {
      const response = await fetch(`${API_BASE}/settings`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Error fetching settings:', error);
        throw new Error(error.error || 'Failed to fetch settings');
      }
      
      return response.json();
    } catch (error) {
      console.error('Get settings request failed:', error);
      throw error;
    }
  },

  async updateSettings(accessToken: string, settings: any) {
    try {
      const response = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Error updating settings:', error);
        throw new Error(error.error || 'Failed to update settings');
      }
      
      return response.json();
    } catch (error) {
      console.error('Update settings request failed:', error);
      throw error;
    }
  }
};