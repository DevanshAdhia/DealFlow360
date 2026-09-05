// Mock customer quotation data for standalone dashboard display
// Realistic B2B quotation data for DealFlow360 Customer Portal

export const mockCustomer = {
  id: 'CUS-001',
  name: 'John Carter',
  company: 'Acme Corporation',
  role: 'Procurement Manager',
  tier: 'Gold',
  email: 'john@acme.com',
  phone: '+1 (555) 234-5678',
  address: '100 Silicon Ave, Suite 400, San Francisco, CA 94107',
  avatar: 'J'
};

export const mockNotifications = [
  {
    id: 'N-001',
    title: 'Quotation Q-1024 is ready for review.',
    time: '10 minutes ago',
    read: false,
    quotationId: 'Q-1024'
  },
  {
    id: 'N-002',
    title: 'Sales team responded to your negotiation request on Q-1021.',
    time: '2 hours ago',
    read: false,
    quotationId: 'Q-1021'
  },
  {
    id: 'N-003',
    title: 'Your requested discount was approved for Q-1018.',
    time: '5 hours ago',
    read: false,
    quotationId: 'Q-1018'
  },
  {
    id: 'N-004',
    title: 'Your requested terms for Q-1015 were rejected.',
    time: 'Yesterday',
    read: false,
    quotationId: 'Q-1015'
  },
  {
    id: 'N-005',
    title: 'Quotation Q-1018 expires tomorrow.',
    time: 'Yesterday',
    read: true,
    quotationId: 'Q-1018'
  },
  {
    id: 'N-006',
    title: 'Quotation Q-1010 confirmed and sent to fulfillment.',
    time: '3 days ago',
    read: true,
    quotationId: 'Q-1010'
  }
];

export const mockActivity = [
  {
    id: 'ACT-01',
    title: 'Quotation Q-1024 Received',
    desc: 'Enterprise Laptop Bundle quotation received from Sarah Wilson.',
    time: 'Today, 09:30 AM',
    type: 'sent',
    quotationId: 'Q-1024'
  },
  {
    id: 'ACT-02',
    title: 'Counter Offer Submitted',
    desc: 'You requested an 18% discount on Cloud Infrastructure Package (Q-1021).',
    time: 'Today, 12:00 PM',
    type: 'negotiation',
    quotationId: 'Q-1021'
  },
  {
    id: 'ACT-03',
    title: 'Manager Approval Granted',
    desc: 'Discount of 15% approved on Annual Support Package (Q-1018).',
    time: 'Yesterday, 12:00 PM',
    type: 'approved',
    quotationId: 'Q-1018'
  },
  {
    id: 'ACT-04',
    title: 'Discount Request Rejected',
    desc: 'Server Upgrade (Q-1015) 20% discount request exceeded maximum tier limit.',
    time: 'Yesterday, 09:15 AM',
    type: 'rejected',
    quotationId: 'Q-1015'
  },
  {
    id: 'ACT-05',
    title: 'Quotation Q-1010 Confirmed',
    desc: 'Security Package confirmed and proceeding to billing and delivery.',
    time: '28 Aug 2026',
    type: 'confirmed',
    quotationId: 'Q-1010'
  }
];
