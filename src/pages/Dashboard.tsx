
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SwapRequest, User } from '@/types';
import { getSwapRequests, updateSwapRequest, getUsers } from '@/lib/storage';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, User as UserIcon } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useUser();
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (user) {
      const requests = getSwapRequests().filter(
        req => req.toUserId === user.id || req.fromUserId === user.id
      );
      setSwapRequests(requests);
      setUsers(getUsers());
    }
  }, [user]);

  const handleSwapResponse = (requestId: string, status: 'accepted' | 'rejected') => {
    updateSwapRequest(requestId, { status });
    setSwapRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status } : req
      )
    );
  };

  const getUserById = (id: string) => users.find(u => u.id === id);

  const pendingRequests = swapRequests.filter(req => req.status === 'pending' && req.toUserId === user?.id);
  const sentRequests = swapRequests.filter(req => req.fromUserId === user?.id);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p>Please sign in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Manage your skill swaps and profile</p>
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests">Swap Requests</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Requests ({pendingRequests.length})
                </CardTitle>
                <CardDescription>Requests waiting for your response</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingRequests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No pending requests</p>
                ) : (
                  pendingRequests.map(request => {
                    const fromUser = getUserById(request.fromUserId);
                    return (
                      <div key={request.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          <span className="font-medium">{fromUser?.name || 'Unknown User'}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{request.message}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSwapResponse(request.id, 'accepted')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSwapResponse(request.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sent Requests ({sentRequests.length})</CardTitle>
                <CardDescription>Requests you've sent to others</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sentRequests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No sent requests</p>
                ) : (
                  sentRequests.map(request => {
                    const toUser = getUserById(request.toUserId);
                    return (
                      <div key={request.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            <span className="font-medium">{toUser?.name || 'Unknown User'}</span>
                          </div>
                          <Badge variant={
                            request.status === 'accepted' ? 'default' :
                            request.status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{request.message}</p>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Management</CardTitle>
              <CardDescription>Update your profile and skills</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Profile editing functionality coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
