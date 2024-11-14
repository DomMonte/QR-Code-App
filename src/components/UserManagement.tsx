import React, { useEffect, useState } from 'react';
import { UserPlus, RefreshCw, Loader2, Trash2, UserCog } from 'lucide-react';
import { supabase, inviteUser, deleteUser, updateUserRole, type UserRole } from '../lib/supabase';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  confirmed_at: string | null;
  last_sign_in_at: string | null;
}

interface UserManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserManagement({ open, onOpenChange }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('standard_admin');
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('standard_admin');

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .neq('id', currentUser?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing('invite');
    setError(null);
    setSuccess(null);

    try {
      const { error } = await inviteUser(inviteEmail, selectedRole);
      
      if (error) throw error;

      setSuccess('User invited successfully! They will receive an email to set their password.');
      setInviteEmail('');
      
      setTimeout(() => {
        loadUsers();
      }, 1000);
    } catch (error: any) {
      console.error('Error inviting user:', error);
      setError(error.message || 'Failed to invite user');
    } finally {
      setProcessing(null);
    }
  };

  const handleResetPassword = async (userId: string, email: string) => {
    setProcessing(userId);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      );

      if (error) throw error;
      setSuccess(`Password reset email sent to ${email}`);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setProcessing(userId);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await deleteUser(userId);
      
      if (error) throw error;
      
      setSuccess('User deleted successfully');
      await loadUsers();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setProcessing(selectedUser.id);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await updateUserRole(selectedUser.id, newRole);
      
      if (error) throw error;
      
      setSuccess(`Role updated successfully for ${selectedUser.email}`);
      setShowRoleDialog(false);
      await loadUsers();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setProcessing(null);
    }
  };

  const formatRole = (role: string) => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl w-11/12">
          <DialogHeader>
            <DialogTitle>User Management</DialogTitle>
            <DialogDescription>
              Manage users and send invitations
            </DialogDescription>
          </DialogHeader>

          {/* Invite User Form */}
          <form onSubmit={handleInviteUser} className="space-y-4 mb-6">
            <div className="flex gap-4">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email address"
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground"
                required
              />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background text-foreground"
              >
                <option value="standard_admin">Standard Admin</option>
                <option value="global_admin">Global Admin</option>
              </select>
              <Button type="submit" disabled={processing === 'invite'}>
                {processing === 'invite' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                Invite User
              </Button>
            </div>
          </form>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 px-4 py-3 rounded-md mb-4">
              {success}
            </div>
          )}

          {/* Users List */}
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-foreground" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatRole(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.confirmed_at 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                        }`}>
                          {user.confirmed_at ? 'Active' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role as UserRole);
                              setShowRoleDialog(true);
                            }}
                            disabled={processing === user.id}
                          >
                            <UserCog className="w-4 h-4 mr-2" />
                            Change Role
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetPassword(user.id, user.email)}
                            disabled={processing === user.id}
                          >
                            {processing === user.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Reset Password
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={processing === user.id}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update role for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateRole} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-foreground">
                Select Role
              </label>
              <select
                id="role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background text-foreground"
              >
                <option value="standard_admin">Standard Admin</option>
                <option value="global_admin">Global Admin</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRoleDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={processing === selectedUser?.id}
              >
                {processing === selectedUser?.id ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  'Update Role'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}