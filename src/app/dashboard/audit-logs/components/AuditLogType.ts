export type AuditLog = {
  id: number;
  userId: number;
  action: string;
  entity: string;
  entityId: number;
  details: any; 
  createdAt: string;
  user: { 
    username: string;
    fullName: string;
  };
};