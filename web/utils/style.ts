export const getRoleBadgeStyle = (role: string) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'developer':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'client':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'designer':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'manager':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};
