
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search as SearchIcon, Filter, MapPin, X } from 'lucide-react';
import { User } from '@/types';
import { UserCard } from '@/components/UserCard';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';

const fetchUsers = async (token: string): Promise<User[]> => {
  const response = await fetch('/api/users/search', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  
  const users = await response.json();
  return users.map((user: any) => ({
    id: user.id,
    name: user.name,
    email: user.email || '',
    location: user.location,
    profilePicture: user.profile_picture,
    skillsOffered: user.skills_offered || [],
    skillsWanted: user.skills_wanted || [],
    availability: user.availability || '',
    isPublic: true,
    isActive: true,
    isBanned: false,
    createdAt: new Date().toISOString(),
    clerkId: user.id
  }));
};

export const Search = () => {
  const { user, getToken } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');
      return fetchUsers(token);
    },
    enabled: !!user,
  });

  useEffect(() => {
    let filtered = users;

    // Apply search term filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user => {
        const nameMatch = user.name.toLowerCase().includes(searchLower);
        const locationMatch = user.location?.toLowerCase().includes(searchLower);
        const skillsOfferedMatch = user.skillsOffered.some(skill => 
          skill.toLowerCase().includes(searchLower)
        );
        const skillsWantedMatch = user.skillsWanted.some(skill => 
          skill.toLowerCase().includes(searchLower)
        );

        return nameMatch || locationMatch || skillsOfferedMatch || skillsWantedMatch;
      });
    }

    // Apply location filter
    if (locationFilter.trim()) {
      const locationLower = locationFilter.toLowerCase();
      filtered = filtered.filter(user => 
        user.location?.toLowerCase().includes(locationLower)
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, locationFilter, users]);

  const clearLocationFilter = () => {
    setLocationFilter('');
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center text-red-500">Error loading users. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Find Skills</h1>
        <p className="text-muted-foreground">Discover people with the skills you need</p>
      </div>

      <div className="mb-8">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, location, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {locationFilter && <Badge variant="secondary" className="ml-2">1</Badge>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="location"
                      placeholder="Filter by location..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    />
                    {locationFilter && (
                      <Button size="sm" variant="ghost" onClick={clearLocationFilter}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters */}
      {locationFilter && (
        <div className="mb-6 flex gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {locationFilter}
            <button onClick={clearLocationFilter} className="ml-1">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}

      <div className="mb-6">
        <p className="text-muted-foreground">
          Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(targetUser => (
          <UserCard 
            key={targetUser.id} 
            user={targetUser} 
            currentUserId={user?.id}
            showSwapButton={true}
          />
        ))}
      </div>

      {filteredUsers.length === 0 && (searchTerm || locationFilter) && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No users found matching your search.</p>
          <p className="text-muted-foreground">Try different keywords or check the spelling.</p>
        </div>
      )}
    </div>
  );
};
