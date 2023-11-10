export default [
  { heading: 'Loyalty System' },
  {
    title: 'Vendor Membership',
    icon: { icon: 'tabler-award' },
    children: [
      { title: 'Level Settings', to: 'vendor-membership-level-settings' },
      { title: 'Membership Benefit', },
    ],
  },
  {
    title: 'Employee Rank',
    icon: { icon: 'tabler-medal' },
    children: [
      { title: 'Benefit', to: 'employee-rank-rank-settings' },
    ],
  },
  {
    title: 'Rewards & Redeem',
    icon: { icon: 'tabler-gift' },
    children: [
      { title: 'Vendor Rewards'},
      { title: 'Vendor Redemption'},
      { title: 'Employee Rewards'},
      { title: 'Employee Redemption'},
    ],
  },
]
