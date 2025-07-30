import { useState } from "react";
import { Bell, Settings, Check, Trash2, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const NotificationCenter = () => {
  const {
    notifications,
    settings,
    permission,
    unreadCount,
    requestPermission,
    updateSettings,
    markAsRead,
    markAllAsRead,
    clearAll,
    sendTestNotification
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const handlePermissionRequest = async () => {
    await requestPermission();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center" 
              variant="destructive"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="notifications" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications">Recent</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4 mt-4">
            {/* Quick Actions */}
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={markAllAsRead}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearAll}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <Card className="p-6 text-center">
                  <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No notifications yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You'll see updates about jobs and system events here
                  </p>
                </Card>
              ) : (
                notifications.map((notification) => (
                  <Card 
                    key={notification.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      !notification.read && "border-primary bg-primary/5"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-lg mt-1">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(notification.timestamp, 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            {/* Permission Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Browser Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Status: {permission}
                    </p>
                  </div>
                  {permission === 'denied' ? (
                    <Badge variant="destructive">Blocked</Badge>
                  ) : permission === 'granted' ? (
                    <Badge variant="default">Enabled</Badge>
                  ) : (
                    <Button size="sm" onClick={handlePermissionRequest}>
                      Enable
                    </Button>
                  )}
                </div>

                {permission === 'granted' && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="push-notifications"
                      checked={settings.push}
                      onCheckedChange={(checked) => updateSettings({ push: checked })}
                    />
                    <Label htmlFor="push-notifications">
                      Show desktop notifications
                    </Label>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notification Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="new-jobs"
                    checked={settings.newJobs}
                    onCheckedChange={(checked) => updateSettings({ newJobs: checked })}
                  />
                  <Label htmlFor="new-jobs">New job submissions</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="urgent-jobs"
                    checked={settings.urgentJobs}
                    onCheckedChange={(checked) => updateSettings({ urgentJobs: checked })}
                  />
                  <Label htmlFor="urgent-jobs">Urgent job alerts</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="reminders"
                    checked={settings.reminders}
                    onCheckedChange={(checked) => updateSettings({ reminders: checked })}
                  />
                  <Label htmlFor="reminders">Follow-up reminders</Label>
                </div>
              </CardContent>
            </Card>

            {/* Communication Channels */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Communication Channels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email-notifications"
                    checked={settings.email}
                    onCheckedChange={(checked) => updateSettings({ email: checked })}
                  />
                  <Label htmlFor="email-notifications">Email notifications</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="sms-notifications"
                    checked={settings.sms}
                    onCheckedChange={(checked) => updateSettings({ sms: checked })}
                  />
                  <Label htmlFor="sms-notifications">SMS notifications</Label>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Test Notification */}
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={sendTestNotification}
                className="w-full"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Send Test Notification
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Test your notification settings
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;