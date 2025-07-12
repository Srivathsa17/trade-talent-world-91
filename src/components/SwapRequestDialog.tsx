
import { useState } from 'react';
import { User } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { createSwapRequest, getUserById } from '../lib/storage';
import { toast } from './ui/use-toast';

interface SwapRequestDialogProps {
  targetUser: User;
  currentUserId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SwapRequestDialog = ({ targetUser, currentUserId, open, onOpenChange }: SwapRequestDialogProps) => {
  const [skillOffered, setSkillOffered] = useState('');
  const [skillWanted, setSkillWanted] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = getUserById(currentUserId);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSubmitting(true);

    try {
      createSwapRequest({
        fromUserId: currentUserId,
        toUserId: targetUser.id,
        fromUserName: currentUser.name,
        toUserName: targetUser.name,
        skillOffered,
        skillWanted,
        message,
        status: 'pending'
      });

      toast({
        title: "Swap request sent!",
        description: `Your request has been sent to ${targetUser.name}.`
      });

      onOpenChange(false);
      setSkillOffered('');
      setSkillWanted('');
      setMessage('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send swap request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Swap Request to {targetUser.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="skillOffered">Skill You're Offering</Label>
            <Select value={skillOffered} onValueChange={setSkillOffered} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill you offer" />
              </SelectTrigger>
              <SelectContent>
                {currentUser?.skillsOffered.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="skillWanted">Skill You Want</Label>
            <Select value={skillWanted} onValueChange={setSkillWanted} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill you want" />
              </SelectTrigger>
              <SelectContent>
                {targetUser.skillsOffered.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              rows={3}
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
