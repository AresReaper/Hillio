import { Timestamp } from 'firebase/firestore';

export interface Trip {
  id: string;
  name: string;
  destination?: string;
  tripDate?: Timestamp;
  createdAt: Timestamp;
  creatorId: string;
  createdBy: string;
  admins?: string[];
  accessKey?: string;
}

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  status: 'Not Boarded' | 'Boarded';
  joinedAt: Timestamp;
  boardedAt?: Timestamp;
  sos?: {
    active: boolean;
    location?: {
      lat: number;
      lng: number;
    };
    timestamp: Timestamp;
    message?: string;
  };
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
}
