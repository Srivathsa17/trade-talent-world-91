
import { User } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Clock, Send } from 'lucide-react';
import { useState } from 'react';
import { SwapRequestDialog } from './SwapRequestDialog';

interface UserCardProps {
  user: User;
  currentUserId?: string;
  showSwapButton?: boolean;
}

export const UserCard = ({ user, currentUserId, showSwapButton = true }: UserCardProps) => {
  const [showSwapDialog, setShowSwapDialog] = useState(false);

  const canSendSwapRequest = showSwapButton && currentUserId && currentUserId !== user.id;

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center space-x-3">
            {user.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-muted-foreground">
                  {user.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              {user.location && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  {user.location}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Skills Offered</h4>
            <div className="flex flex-wrap gap-1">
              {user.skillsOffered.map((skill, index) => (
                <Badge key={index} variant="default" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Skills Wanted</h4>
            <div className="flex flex-wrap gap-1">
              {user.skillsWanted.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {user.availability && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {user.availability}
            </div>
          )}
        </CardContent>

        {canSendSwapRequest && (
          <CardFooter>
            <Button 
              onClick={() => setShowSwapDialog(true)}
              className="w-full"
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Swap Request
            </Button>
          </CardFooter>
        )}
      </Card>

      {showSwapDialog && (
        <SwapRequestDialog
          targetUser={user}
          currentUserId={currentUserId!}
          open={showSwapDialog}
          onOpenChange={setShowSwapDialog}
        />
      )}
    </>
  );
};
