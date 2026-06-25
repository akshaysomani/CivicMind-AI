import React from 'react';
import type { AdminUser } from '../../services/adminService';
import { Edit2, Ban, Trash2, MoreVertical } from 'lucide-react';

interface UserTableProps {
  users: AdminUser[];
}

export const UserTable: React.FC<UserTableProps> = ({ users }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-4 py-3 rounded-tl-lg">User</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Department/Ward</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Last Login</th>
            <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/20 transition-colors">
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
              </td>
              <td className="px-4 py-3">{user.role}</td>
              <td className="px-4 py-3 text-slate-400">
                {user.department || user.ward || '-'}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  user.status === 'Suspended' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                }`}>
                  {user.status}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-400">
                {new Date(user.lastLogin).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end space-x-2">
                  <button className="p-1 text-slate-400 hover:text-indigo-400 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-slate-400 hover:text-amber-400 transition-colors">
                    <Ban className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-slate-400 hover:text-rose-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-slate-400 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
