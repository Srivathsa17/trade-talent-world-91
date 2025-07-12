
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, CheckCircle, XCircle, User as UserIcon } from 'lucide-react';
import { SwapRequest } from '@/types';
import { getSwapRequests, updateSwapRequest, getUsers } from '@/lib/storage';
import { toast } from 'sonner';

export const NotificationsDropdown = () => {
  const { user } = useUser();
  const [pendingRequests, setPendingRequests] = useState<SwapRequest[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const requests = getSwapRequests().filter(
        req => req.status === 'pending' && req.toUserId === user.id
      );
      setPendingRequests(requests);
    }
  }, [user]);

  const handleSwapResponse = (requestId: string, status: 'accepted' | 'rejected') => {
    updateSwapRequest(requestId, { status });
    setPendingRequests(prev => 
      prev.filter(req => req.id !== requestId)
    );
    
    toast.success(`Swap request ${status} successfully!`);
  };

  const getUserById = (id: string) => {
    const users = getUsers();
    return users.find(u => u.id === id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {pendingRequests.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {pendingRequests.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {pendingRequests.length > 0 && (
              <Badge variant="secondary">{pendingRequests.length} pending</Badge>
            )}
          </div>
          
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No notifications</p>
              <p className="text-sm text-muted-foreground">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pendingRequests.map(request => {
                const fromUser = getUserById(request.fromUserId);
                return (
                  <Card key={request.id} className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <CardTitle className="text-sm">
                          {fromUser?.name || 'Unknown User'}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">New Request</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-xs"><strong>Offering:</strong> {request.skillOffered}</p>
                        <p className="text-xs"><strong>Wants:</strong> {request.skillWanted}</p>
                        <p className="text-xs text-muted-foreground">{request.message}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleSwapResponse(request.id, 'accepted')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleSwapResponse(request.id, 'rejected')}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
