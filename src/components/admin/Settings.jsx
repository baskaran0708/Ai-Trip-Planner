import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    siteName: 'AI Trip Planner',
    maintenanceMode: false,
    analyticsEnabled: true
  });
  
  const [loading, setLoading] = useState(false);

  const handleSwitchChange = (field) => {
    setSettings({
      ...settings,
      [field]: !settings[field]
    });
  };
  
  const handleInputChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value
    });
  };
  
  const saveSettings = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Settings saved successfully');
    }, 1000);
    
    // In a real application, you would save the settings to Firestore here
    // Example:
    // await updateDoc(doc(db, 'app_settings', 'global'), settings);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure general application settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input 
              id="siteName" 
              name="siteName" 
              value={settings.siteName} 
              onChange={handleInputChange}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance">Maintenance Mode</Label>
              <p className="text-sm text-gray-500">
                Put the site in maintenance mode
              </p>
            </div>
            <Switch 
              id="maintenance" 
              checked={settings.maintenanceMode} 
              onCheckedChange={() => handleSwitchChange('maintenanceMode')} 
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure notification settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Enable email notifications for new trips
              </p>
            </div>
            <Switch 
              id="notifications" 
              checked={settings.notificationsEnabled} 
              onCheckedChange={() => handleSwitchChange('notificationsEnabled')} 
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Configure analytics settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="analytics">Usage Analytics</Label>
              <p className="text-sm text-gray-500">
                Collect anonymous usage data
              </p>
            </div>
            <Switch 
              id="analytics" 
              checked={settings.analyticsEnabled} 
              onCheckedChange={() => handleSwitchChange('analyticsEnabled')} 
            />
          </div>
        </CardContent>
      </Card>
      
      <Button 
        onClick={saveSettings} 
        disabled={loading}
        className="min-w-[120px]"
      >
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
};

export default AdminSettings; 