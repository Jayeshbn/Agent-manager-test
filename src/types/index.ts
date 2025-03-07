export interface User {
  id: string;
  email: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  mobile: string;
  assignedLeads: Lead[];
}

export interface Lead {
  id: string;
  firstName: string;
  phone: string;
  notes: string;
  assignedTo?: string;
}