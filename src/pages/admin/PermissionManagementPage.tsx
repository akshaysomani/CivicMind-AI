import React from 'react';
import { Key, Save } from 'lucide-react';

const MODULES = ['Users', 'Roles', 'AI Agents', 'Workflows', 'GIS Maps', 'Reports', 'Settings'];
const ROLES = ['Admin', 'Dept Head', 'Ward Officer', 'Emergency', 'Citizen'];

const MOCK_MATRIX: Record<string, Record<string, boolean>> = {
  'Users': { 'Admin': true, 'Dept Head': false, 'Ward Officer': false, 'Emergency': false, 'Citizen': false },
  'Roles': { 'Admin': true, 'Dept Head': false, 'Ward Officer': false, 'Emergency': false, 'Citizen': false },
  'AI Agents': { 'Admin': true, 'Dept Head': true, 'Ward Officer': true, 'Emergency': true, 'Citizen': true },
  'Workflows': { 'Admin': true, 'Dept Head': true, 'Ward Officer': false, 'Emergency': false, 'Citizen': false },
  'GIS Maps': { 'Admin': true, 'Dept Head': true, 'Ward Officer': true, 'Emergency': true, 'Citizen': false },
  'Reports': { 'Admin': true, 'Dept Head': true, 'Ward Officer': true, 'Emergency': true, 'Citizen': true },
  'Settings': { 'Admin': true, 'Dept Head': false, 'Ward Officer': false, 'Emergency': false, 'Citizen': false },
};

export const PermissionManagementPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Permission Matrix</h1>
          <p className="text-slate-400">Detailed view of fine-grained access control across resources.</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-4 rounded-tl-lg font-semibold flex items-center">
                  <Key className="w-4 h-4 mr-2" />
                  Module / Resource
                </th>
                {ROLES.map(role => (
                  <th key={role} className="px-4 py-4 text-center">{role}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((mod, idx) => (
                <tr key={mod} className="border-b border-slate-800 hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-4 font-medium text-white">{mod}</td>
                  {ROLES.map(role => (
                    <td key={`${mod}-${role}`} className="px-4 py-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          defaultChecked={MOCK_MATRIX[mod][role]}
                          disabled={role === 'Admin'} // Admin can't be unchecked easily
                        />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500 peer-disabled:opacity-50"></div>
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PermissionManagementPage;
