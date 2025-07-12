
export interface User {
  id: string;
  name: string;
  email: string;
  location?: string;
  profilePicture?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string;
  isPublic: boolean;
  isActive: boolean;
  isBanned?: boolean;
  createdAt: string;
  clerkId: string;
}

export interface SwapRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  toUserName: string;
  skillOffered: string;
  skillWanted: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  swapRequestId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface AdminAction {
  id: string;
  type: 'user_banned' | 'user_unbanned' | 'delete_skill' | 'delete_swap';
  targetId: string;
  adminId: string;
  reason: string;
  timestamp: string;
  createdAt: string;
}
