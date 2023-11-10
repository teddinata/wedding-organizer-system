export default [
  { heading: 'Web Apps' },
  {
    title: 'Leads',
    icon: { icon: 'tabler-headset' },
    children: [
      { title: 'Priority' },
      { title: 'Grade A' },
      { title: 'Grade B' },
      { title: 'Grade C' },
      { title: 'No Grade' },
      { title: 'Catering' },
      { title: 'WO & EO' }
    ]
    // to: 'apps-email',
  },
  {
    title: 'Vendors',
    icon: { icon: 'tabler-clipboard-check' },
    children: [
      { title: 'Vendor List', to: 'vendors-list' },
      { title: 'Limit Settings', to: 'vendors-limit' },
      { title: 'Grade Settings', to: 'vendors-grade' },
    ]
  },
  {
    title: 'Products',
    icon: { icon: 'tabler-box' },
    children: [
      { title: 'List', to: 'products-list' },
      { title: 'Add-on', to: 'products-add-on' },
      { title: 'Checklist Item', to: 'products-checklist-item' },
    ]
  },
  {
    title: 'Employee',
    icon: { icon: 'tabler-users' },
    children: [
      { title: 'List', to: 'employee-list' },
      { title: 'Department', to: 'employee-department' },
      { title: 'Position', to: 'employee-position' },
      { title: 'Teams', to: 'employee-team' },
      { title: 'Allowance', to: 'employee-allowance' },
    ]
  },
  {
    title: 'Attendance',
    icon: { icon: 'tabler-alarm' },
    children: [
      { title: 'Summary', to: 'attendance-summary' },
      { title: 'Attendance', to: 'attendance-form' },
    ]
  },
  {
    title: 'Loan Management',
    icon: { icon: 'tabler-wallet' },
    children: [
      { title: 'Request Loan', },
      { title: 'Personal Loan', },
      { title: 'Team Loan', },
    ]
  },
  {
    title: 'Payroll',
    icon: { icon: 'tabler-brand-cashapp' },
    children: [
      { title: 'Summary', },
      { title: 'Allowance', },
      { title: 'Office Dept', },
      { title: 'Operational Dept', },
    ]
  },
  {
    title: 'Users',
    icon: { icon: 'tabler-users' },
    children: [
      { title: 'List', to: 'users-list' }
    ]
  },
  {
    title: 'Roles & Permissions',
    icon: { icon: 'tabler-settings' },
    children: [
      { title: 'List', to: 'roles-permissions-list' }
    ]
  }
]
