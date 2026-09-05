// Demo Users Database for DealFlow360 Phase 1 Hackathon Demo

export const MOCK_USERS = [
  {
    id: 'USR-001',
    name: 'Alex Morgan',
    email: 'sales@dealflow360.demo',
    password: 'Sales@123',
    role: 'sales_rep',
    roleLabel: 'Sales Rep',
    title: 'Senior Account Executive',
    department: 'Enterprise Sales',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    assignedWorkspace: 'Sales Workspace',
    permissions: ['view_dashboard', 'manage_quotes', 'view_pipeline', 'submit_approvals']
  },
  {
    id: 'USR-002',
    name: 'Sarah Jenkins',
    email: 'manager@dealflow360.demo',
    password: 'Manager@123',
    role: 'sales_manager',
    roleLabel: 'Sales Manager',
    title: 'VP of Global Sales',
    department: 'Sales Operations',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    assignedWorkspace: 'Manager Workspace',
    permissions: ['view_dashboard', 'manage_quotes', 'view_pipeline', 'approve_discounts', 'view_team_analytics']
  },
  {
    id: 'USR-003',
    name: 'Marcus Vance',
    email: 'finance@dealflow360.demo',
    password: 'Finance@123',
    role: 'finance',
    roleLabel: 'Finance / Ops',
    title: 'Director of Commercial Finance',
    department: 'Finance & RevOps',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    assignedWorkspace: 'Finance Workspace',
    permissions: ['view_dashboard', 'approve_high_discounts', 'view_billing', 'manage_fulfillment', 'financial_reports']
  },
  {
    id: 'USR-004',
    name: 'Elena Rostova',
    email: 'customer@dealflow360.demo',
    password: 'Customer@123',
    role: 'customer',
    roleLabel: 'Customer',
    title: 'Procurement Director',
    department: 'Apex Global Technologies',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    assignedWorkspace: 'Customer Portal',
    permissions: ['view_quotes', 'negotiate_terms', 'sign_contracts', 'view_invoices']
  },
  {
    id: 'USR-005',
    name: 'David Sterling',
    email: 'admin@dealflow360.demo',
    password: 'Admin@123',
    role: 'admin',
    roleLabel: 'Admin',
    title: 'Chief Operations Officer',
    department: 'System Administration',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    assignedWorkspace: 'Admin Workspace',
    permissions: ['all']
  }
];

export const getRoleBadgeColor = (role) => {
  switch (role) {
    case 'admin':
      return 'badge-error';
    case 'sales_manager':
      return 'badge-warning';
    case 'finance':
      return 'badge-primary';
    case 'customer':
      return 'badge-success';
    case 'sales_rep':
    default:
      return 'badge-neutral';
  }
};
