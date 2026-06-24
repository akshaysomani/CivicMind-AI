import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { UserTable } from '../../components/admin/UserTable';
import { Search, Filter, UserPlus, Download } from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { users, loading } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roles = ['All', ...Array.from(new Set(users.map(u => u.role)))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-slate-400">Manage all users, their roles, and access across CivicMind AI.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-800/20">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500" />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg text-sm text-white py-2 pl-3 pr-8 focus:outline-none focus:border-indigo-500"
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        <UserTable users={filteredUsers} />
        
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-sm text-slate-400 bg-slate-800/20">
          <div>Showing {filteredUsers.length} of {users.length} users</div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50">Previous</button>
            <button className="px-3 py-1 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
