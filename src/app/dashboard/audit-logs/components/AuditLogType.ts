export type AuditLog = {
  id: number;
  userId: number;
  action: string;
  entity: string;
  entityId: number;
  details: unknown; 
  createdAt: string;
  user: { 
    username: string;
    fullName: string;
  };
};