
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/types';
import { createSwapRequest, getUserByClerkId } from '@/lib/storage';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

interface SwapRequestDialogProps {
  targetUser: User;
  currentUserId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SwapRequestDialog = ({ targetUser, currentUserId, open, onOpenChange }: SwapRequestDialogProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedSkillOffered, setSelectedSkillOffered] = useState('');
  const [selectedSkillWanted, setSelectedSkillWanted] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUserId) {
      const user = getUserByClerkId(currentUserId);
      setCurrentUser(user);
    }
  }, [currentUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSkillOffered || !selectedSkillWanted || !message.trim() || !currentUser) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      createSwapRequest({
        fromUserId: currentUserId,
        toUserId: targetUser.id,
        fromUserName: currentUser.name,
        toUserName: targetUser.name,
        skillOffered: selectedSkillOffered,
        skillWanted: selectedSkillWanted,
        message: message.trim(),
        status: 'pending'
      });

      toast.success('Swap request sent successfully!');
      onOpenChange(false);
      
      // Reset form
      setSelectedSkillOffered('');
      setSelectedSkillWanted('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send swap request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedSkillOffered('');
    setSelectedSkillWanted('');
    setMessage('');
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  if (!currentUser) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Swap Request</DialogTitle>
          <DialogDescription>
            Send a skill swap request to {targetUser.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skillOffered">Skill I'm Offering</Label>
            <Select value={selectedSkillOffered} onValueChange={setSelectedSkillOffered}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill you can offer" />
              </SelectTrigger>
              <SelectContent>
                {currentUser.skillsOffered.map((skill, index) => (
                  <SelectItem key={index} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentUser.skillsOffered.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Add skills to your profile first to send swap requests
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="skillWanted">Skill I Want to Learn</Label>
            <Select value={selectedSkillWanted} onValueChange={setSelectedSkillWanted}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill from their offerings" />
              </SelectTrigger>
              <SelectContent>
                {targetUser.skillsOffered.map((skill, index) => (
                  <SelectItem key={index} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Tell them why you'd like to swap skills..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !selectedSkillOffered || !selectedSkillWanted || !message.trim()}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
