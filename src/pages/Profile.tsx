
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { User } from '@/types';
import { getUsers, updateUser } from '@/lib/storage';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';

export const Profile = () => {
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    availability: '',
    skillsOffered: [] as string[],
    skillsWanted: [] as string[],
    isPublic: true
  });
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');

  useEffect(() => {
    if (clerkUser) {
      const users = getUsers();
      const currentUser = users.find(u => u.id === clerkUser.id);
      
      if (currentUser) {
        setUser(currentUser);
        setFormData({
          name: currentUser.name,
          location: currentUser.location || '',
          availability: currentUser.availability || '',
          skillsOffered: [...currentUser.skillsOffered],
          skillsWanted: [...currentUser.skillsWanted],
          isPublic: currentUser.isPublic
        });
      }
    }
  }, [clerkUser]);

  const handleSave = () => {
    if (!clerkUser || !user) return;

    const updatedUser: User = {
      ...user,
      name: formData.name,
      location: formData.location || undefined,
      availability: formData.availability || undefined,
      skillsOffered: formData.skillsOffered,
      skillsWanted: formData.skillsWanted,
      isPublic: formData.isPublic
    };

    updateUser(clerkUser.id, updatedUser);
    setUser(updatedUser);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const addSkill = (type: 'offered' | 'wanted') => {
    const skill = type === 'offered' ? newSkillOffered : newSkillWanted;
    if (!skill.trim()) return;

    if (type === 'offered') {
      setFormData(prev => ({
        ...prev,
        skillsOffered: [...prev.skillsOffered, skill.trim()]
      }));
      setNewSkillOffered('');
    } else {
      setFormData(prev => ({
        ...prev,
        skillsWanted: [...prev.skillsWanted, skill.trim()]
      }));
      setNewSkillWanted('');
    }
  };

  const removeSkill = (type: 'offered' | 'wanted', index: number) => {
    if (type === 'offered') {
      setFormData(prev => ({
        ...prev,
        skillsOffered: prev.skillsOffered.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        skillsWanted: prev.skillsWanted.filter((_, i) => i !== index)
      }));
    }
  };

  if (!clerkUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your profile and skills</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your profile details and skills</CardDescription>
          </div>
          <Button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            variant={isEditing ? "default" : "outline"}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                disabled={!isEditing}
                placeholder="e.g., San Francisco, CA"
              />
            </div>

            <div>
              <Label htmlFor="availability">Availability</Label>
              <Textarea
                id="availability"
                value={formData.availability}
                onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                disabled={!isEditing}
                placeholder="e.g., Weekends, Evenings after 6pm..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                disabled={!isEditing}
              />
              <Label htmlFor="public">Make profile public</Label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Skills I Can Offer</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {formData.skillsOffered.map((skill, index) => (
                  <Badge key={index} variant="default" className="flex items-center gap-1">
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => removeSkill('offered', index)}
                        className="ml-1 hover:bg-primary-foreground/20 rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    value={newSkillOffered}
                    onChange={(e) => setNewSkillOffered(e.target.value)}
                    placeholder="Add a skill you can offer"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill('offered')}
                  />
                  <Button onClick={() => addSkill('offered')} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label>Skills I Want to Learn</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {formData.skillsWanted.map((skill, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => removeSkill('wanted', index)}
                        className="ml-1 hover:bg-muted rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    value={newSkillWanted}
                    onChange={(e) => setNewSkillWanted(e.target.value)}
                    placeholder="Add a skill you want to learn"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill('wanted')}
                  />
                  <Button onClick={() => addSkill('wanted')} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave}>Save Changes</Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data to current user data
                  if (user) {
                    setFormData({
                      name: user.name,
                      location: user.location || '',
                      availability: user.availability || '',
                      skillsOffered: [...user.skillsOffered],
                      skillsWanted: [...user.skillsWanted],
                      isPublic: user.isPublic
                    });
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
