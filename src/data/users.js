export const MOCK_USERS = [];

export const getRoleBadgeColor = (role) => {
  switch (role) {
    case 'admin':
    case 'ADMIN':
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
