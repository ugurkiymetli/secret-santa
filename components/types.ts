export interface User {
  _id: string;
  username: string;
  name: string;
  role: string;
  isActivated?: boolean;
}

export interface Match {
  giver: string;
  receiver: string;
  isRevealed: boolean;
  giverRevealedDate?: string;
}

export interface Event {
  _id: string;
  name: string;
  giftLimit: number;
  giftDate?: string;
  status: string;
  matches?: Match[];
}
