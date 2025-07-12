
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { User } from '@/types';
import { getUsers } from '@/lib/storage';
import { UserCard } from '@/components/UserCard';

export const Search = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    const allUsers = getUsers();
    setUsers(allUsers);
    setFilteredUsers(allUsers);
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
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

    setFilteredUsers(filtered);
  }, [searchTerm, users]);

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
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-muted-foreground">
          Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      {filteredUsers.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No users found matching your search.</p>
          <p className="text-muted-foreground">Try different keywords or check the spelling.</p>
        </div>
      )}
    </div>
  );
};
