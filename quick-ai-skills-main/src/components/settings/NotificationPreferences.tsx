import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Clock, Smartphone, Mail, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreferences {
  dailyReminders: boolean;
  streakReminders: boolean;
  newLessons: boolean;
  achievements: boolean;
  weeklyProgress: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  reminderTime: string;
  reminderDays: string[];
  frequency: string;
}

export const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    dailyReminders: true,
    streakReminders: true,
    newLessons: true,
    achievements: true,
    weeklyProgress: false,
    pushNotifications: true,
    emailNotifications: false,
    reminderTime: "09:00",
    reminderDays: ["mon", "tue", "wed", "thu", "fri"],
    frequency: "daily"
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleTimeChange = (time: string) => {
    setPreferences(prev => ({ ...prev, reminderTime: time }));
  };

  const handleDayToggle = (day: string) => {
    setPreferences(prev => ({
      ...prev,
      reminderDays: prev.reminderDays.includes(day)
        ? prev.reminderDays.filter(d => d !== day)
        : [...prev.reminderDays, day]
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Mock API call - in real app this would be GraphQL mutation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('updateNotificationPrefs mutation:', preferences);
      
      toast({
        title: "Preferences saved!",
        description: "Your notification settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error saving preferences",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        handleToggle('pushNotifications', true);
        toast({
          title: "Notifications enabled!",
          description: "You'll receive learning reminders and updates.",
        });
      }
    }
  };

  const days = [
    { id: 'mon', label: 'Mon' },
    { id: 'tue', label: 'Tue' },
    { id: 'wed', label: 'Wed' },
    { id: 'thu', label: 'Thu' },
    { id: 'fri', label: 'Fri' },
    { id: 'sat', label: 'Sat' },
    { id: 'sun', label: 'Sun' }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Notification Preferences</h1>
        <p className="text-muted-foreground">
          Customize when and how you receive learning reminders
        </p>
      </div>

      {/* Push Notification Setup */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Enable push notifications</p>
              <p className="text-sm text-muted-foreground">Get reminders and updates on your device</p>
            </div>
            <Switch
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) => {
                if (checked) {
                  requestNotificationPermission();
                } else {
                  handleToggle('pushNotifications', false);
                }
              }}
            />
          </div>
          
          {!preferences.pushNotifications && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                Enable notifications to get the most out of your learning experience
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            What to notify me about
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: 'dailyReminders' as keyof NotificationPreferences,
              title: 'Daily learning reminders',
              description: 'Get reminded to complete your daily lesson',
              icon: Clock
            },
            {
              key: 'streakReminders' as keyof NotificationPreferences,
              title: 'Streak protection',
              description: 'Alerts when your learning streak is at risk',
              icon: Bell
            },
            {
              key: 'newLessons' as keyof NotificationPreferences,
              title: 'New lesson releases',
              description: 'Notify when new content becomes available',
              icon: MessageSquare
            },
            {
              key: 'achievements' as keyof NotificationPreferences,
              title: 'Achievements & badges',
              description: 'Celebrate when you earn new achievements',
              icon: Bell
            },
            {
              key: 'weeklyProgress' as keyof NotificationPreferences,
              title: 'Weekly progress summary',
              description: 'Get a summary of your learning progress',
              icon: Mail
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <Switch
                  checked={preferences[item.key] as boolean}
                  onCheckedChange={(checked) => handleToggle(item.key, checked)}
                  disabled={!preferences.pushNotifications && !preferences.emailNotifications}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Timing Settings */}
      {preferences.dailyReminders && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Reminder Timing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Reminder time</label>
              <Select value={preferences.reminderTime} onValueChange={handleTimeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <SelectItem key={i} value={`${hour}:00`}>
                        {hour}:00
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Reminder days</label>
              <div className="flex gap-2">
                {days.map((day) => (
                  <Button
                    key={day.id}
                    variant={preferences.reminderDays.includes(day.id) ? "default" : "outline"}
                    size="sm"
                    className={`h-10 w-12 ${
                      preferences.reminderDays.includes(day.id)
                        ? "bg-gradient-primary border-0 text-primary-foreground"
                        : "hover:border-primary"
                    }`}
                    onClick={() => handleDayToggle(day.id)}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                You'll receive reminders at {preferences.reminderTime} on{' '}
                {preferences.reminderDays.length === 7 ? 'every day' : 
                 preferences.reminderDays.length === 0 ? 'no days' :
                 preferences.reminderDays.map(d => days.find(day => day.id === d)?.label).join(', ')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Notifications */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Email summaries</p>
              <p className="text-sm text-muted-foreground">Receive weekly progress reports via email</p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => handleToggle('emailNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-center pt-4">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="bg-gradient-primary border-0 text-primary-foreground hover:opacity-90 px-8"
        >
          {isLoading ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
};