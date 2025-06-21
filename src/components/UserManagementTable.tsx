import React from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserManagementTableProps {
  users: User[];
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({ users }) => {
  return (
    <div className="bg-card rounded-lg shadow overflow-hidden border">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-1/3">Nombre</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-1/3">Email</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-1/6">Rol</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-1/6">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {users.map(user => (
            <tr key={user.id} className="hover:bg-muted/50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-foreground">{user.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{user.role}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  {/* Edit Icon */}
                   <button className="text-muted-foreground hover:text-foreground" aria-label="Editar usuario">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 0 002-2v-5m-1.414-.707a2 2 0 012.828 0l.707.707m-2.828-.707l-.707.707m-7.071 0l-.707.707M17 10l-2 2m-4 4l-2 2m3-4l2 2m-3-4l2 2" /></svg>
                   </button>
                  {/* Delete Icon */}
                   <button className="text-muted-foreground hover:text-foreground" aria-label="Eliminar usuario">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166M19.5 5.79L15.97 3.58a2.25 2.25 0 00-2.15-1.58H6.362a2.25 2.25 0 00-2.15 1.58L2.28 5.79m.36 0A2.25 2.25 0 015.25 4.5h13.5a2.25 2.25 0 012.25 1.29m-.36 0V19.5a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25V5.79"/></svg>
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

export default UserManagementTable; 