
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { User } from '@/types';
import { getUserByClerkId, updateUser, createUser } from '@/lib/storage';
import { toast } from 'sonner';
import { Edit, Save } from 'lucide-react';
import { ProfilePhoto } from '@/components/ProfilePhoto';
import { SkillsSection } from '@/components/SkillsSection';
import { ProfileForm } from '@/components/ProfileForm';

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

  useEffect(() => {
    if (clerkUser) {
      let currentUser = getUserByClerkId(clerkUser.id);
      
      // If user doesn't exist, create them
      if (!currentUser) {
        const newUser: Omit<User, 'id' | 'createdAt'> = {
          name: clerkUser.fullName || clerkUser.firstName || 'User',
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          location: '',
          skillsOffered: [],
          skillsWanted: [],
          availability: '',
          isPublic: true,
          isActive: true,
          isBanned: false,
          clerkId: clerkUser.id
        };
        currentUser = createUser(newUser);
      }
      
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
  }, [clerkUser]);

  const handleSave = () => {
    if (!clerkUser || !user) return;

    const updatedUser = updateUser(user.id, {
      name: formData.name,
      location: formData.location || undefined,
      availability: formData.availability || undefined,
      skillsOffered: formData.skillsOffered,
      skillsWanted: formData.skillsWanted,
      isPublic: formData.isPublic
    });

    if (updatedUser) {
      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } else {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
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
  };

  if (!clerkUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your profile and skills</p>
        </div>
        <Button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          variant={isEditing ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo and Basic Info */}
        <div className="lg:col-span-1">
          <ProfilePhoto 
            user={user}
            isEditing={isEditing}
            clerkUser={clerkUser}
          />
        </div>

        {/* Main Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileForm
            formData={formData}
            setFormData={setFormData}
            isEditing={isEditing}
          />

          <SkillsSection
            skillsOffered={formData.skillsOffered}
            skillsWanted={formData.skillsWanted}
            isEditing={isEditing}
            onUpdateSkills={(type, skills) => {
              if (type === 'offered') {
                setFormData(prev => ({ ...prev, skillsOffered: skills }));
              } else {
                setFormData(prev => ({ ...prev, skillsWanted: skills }));
              }
            }}
          />

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Privacy Settings</CardTitle>
              <CardDescription>Control who can see your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                  disabled={!isEditing}
                />
                <Label htmlFor="public" className="text-sm">
                  Make profile visible in public search
                </Label>
              </div>
              {!formData.isPublic && (
                <p className="text-xs text-muted-foreground mt-2">
                  Your profile will only be visible to you and won't appear in search results
                </p>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
