import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { User, SwapRequest, AdminAction } from '@/types';
import { getUsers, getSwapRequests, getFeedback, getAdminActions, addAdminAction, updateUser } from '@/lib/storage';
import { toast } from 'sonner';
import { Shield, Users, MessageSquare, BarChart3, Ban, CheckCircle, Download } from 'lucide-react';

export const Admin = () => {
  const { user } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);

  const isAdmin = user?.emailAddresses[0]?.emailAddress === 'admin@skillswap.com';

  useEffect(() => {
    if (isAdmin) {
      setUsers(getUsers());
      setSwapRequests(getSwapRequests());
      setAdminActions(getAdminActions());
    }
  }, [isAdmin]);

  const handleBanUser = (userId: string, isBanned: boolean) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const updatedUser = { ...targetUser, isBanned };
    updateUser(userId, updatedUser);
    
    const action: Omit<AdminAction, 'id' | 'createdAt'> = {
      adminId: user!.id,
      type: isBanned ? 'user_banned' : 'user_unbanned',
      targetId: userId,
      reason: isBanned ? 'Inappropriate behavior' : 'Ban lifted',
      timestamp: new Date().toISOString()
    };
    
    addAdminAction(action);
    setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    setAdminActions(prev => [{ ...action, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...prev]);
    
    toast.success(`User ${isBanned ? 'banned' : 'unbanned'} successfully`);
  };

  const exportCSV = (data: any[], filename: string) => {
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p>Please sign in to access the admin panel.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeUsers = users.filter(u => !u.isBanned).length;
  const bannedUsers = users.filter(u => u.isBanned).length;
  const pendingSwaps = swapRequests.filter(s => s.status === 'pending').length;
  const completedSwaps = swapRequests.filter(s => s.status === 'accepted').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Monitor and manage the Skill Swap Platform</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Ban className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Banned Users</p>
                <p className="text-2xl font-bold">{bannedUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending Swaps</p>
                <p className="text-2xl font-bold">{pendingSwaps}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed Swaps</p>
                <p className="text-2xl font-bold">{completedSwaps}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="swaps">Swap Monitoring</TabsTrigger>
          <TabsTrigger value="actions">Admin Actions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name}</span>
                        {user.isBanned && <Badge variant="destructive">Banned</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Skills: {user.skillsOffered.join(', ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Location: {user.location || 'Not specified'}
                      </p>
                    </div>
                    <Button
                      variant={user.isBanned ? "outline" : "destructive"}
                      size="sm"
                      onClick={() => handleBanUser(user.id, !user.isBanned)}
                    >
                      {user.isBanned ? 'Unban' : 'Ban'} User
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="swaps">
          <Card>
            <CardHeader>
              <CardTitle>Swap Monitoring</CardTitle>
              <CardDescription>Monitor skill swap requests and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {swapRequests.map(request => {
                  const fromUser = users.find(u => u.id === request.fromUserId);
                  const toUser = users.find(u => u.id === request.toUserId);
                  return (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">
                            {fromUser?.name || 'Unknown'} → {toUser?.name || 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">{request.message}</p>
                        </div>
                        <Badge variant={
                          request.status === 'accepted' ? 'default' :
                          request.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions Log</CardTitle>
              <CardDescription>View all administrative actions taken</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminActions.map(action => (
                  <div key={action.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium capitalize">{action.type.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">{action.reason}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(action.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Export Reports</CardTitle>
              <CardDescription>Download CSV reports for analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => exportCSV(users, 'users_report.csv')}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export User Data
              </Button>
              <Button
                onClick={() => exportCSV(swapRequests, 'swaps_report.csv')}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Swap Requests
              </Button>
              <Button
                onClick={() => exportCSV(adminActions, 'admin_actions_report.csv')}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Admin Actions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
