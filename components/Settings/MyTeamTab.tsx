import {
  getUsers,
  updateUser,
  inviteUser,
  getInvitations,
} from '@/lib/api/user';
import { formatDate, getInitials, getFullName } from '@/utils/general';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { FC, useState } from 'react';
import { FaPlus, FaUserShield, FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';
import InviteNewUserModal from './InviteNewUserModal';
import { User, Invitation } from '@/lib/db/schema';
import { Loader } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/useAuth';

const MyTeamTab: FC<{ tenantId: string }> = ({ tenantId }) => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ['users', tenantId],
    queryFn: () => getUsers({ tenantId }),
    select: data => (Array.isArray(data) ? data : []),
  });

  const {
    data: invitations = [],
    isLoading: isLoadingInvitations,
    error: invitationsError,
  } = useQuery({
    queryKey: ['invitations', tenantId],
    queryFn: () => getInvitations(tenantId),
    select: data => (Array.isArray(data) ? data : []),
  });

  const changeAdminStatus = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', tenantId] });
      toast.success(`User updated successfully`, { duration: 2000 });
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const inviteMutation = useMutation({
    mutationFn: inviteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', tenantId] });
      toast.success(`Invitation sent successfully`, { duration: 2000 });
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const { userData } = useAuth();

  if (usersError || invitationsError) {
    return (
      <div className="flex w-full flex-col items-center justify-center p-5">
        Error:{' '}
        {(usersError as Error)?.message ||
          (invitationsError as Error)?.message ||
          'An error occurred'}
      </div>
    );
  }

  const renderUserOrInvitation = (item: User | Invitation) => {
    const isInvitation = 'invitedAt' in item;
    const email = item.email;
    const name = isInvitation
      ? 'Pending Invitation'
      : getFullName(item.firstName, item.lastName);
    const role = isInvitation ? (item.isAdmin ? 'admin' : 'user') : item.role;
    const date = isInvitation ? item.invitedAt : item.createdAt;

    return (
      <li key={item.id} className="flex py-5 justify-between items-center">
        <div className="flex shrink-0 gap-x-4">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-xl font-bold text-gray-600">
            {isInvitation ? '?' : getInitials(item.firstName, item.lastName)}
          </div>
          <div className="min-w-0 flex-auto">
            <div className="flex items-center gap-4">
              <p className="text-md font-semibold leading-6 text-gray-900">
                {name}
              </p>
              <Badge
                className="shrink-0"
                color={role === 'admin' ? 'fuchsia' : 'sky'}
              >
                <div className="text-md shrink-0 break-keep">
                  {role === 'admin' ? 'Admin' : 'User'}
                </div>
              </Badge>
              {isInvitation && (
                <Badge className="shrink-0" color="yellow">
                  <div className="text-md shrink-0 break-keep">Pending</div>
                </Badge>
              )}
            </div>
            <p className="mt-1 truncate text-sm leading-5 text-gray-500">
              {email} · {isInvitation ? 'Invited' : 'Added'} {formatDate(date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isInvitation && item.invitedBy === userData?.email ? (
            <Button
              outline
              onClick={() =>
                inviteMutation.mutate({
                  sendTo: item.email,
                  invitedBy: userData.email,
                  tenantType: item.tenantType,
                  tenantName: item.tenantName,
                  tenantId: item.tenantId,
                  isAdmin: item.isAdmin,
                })
              }
            >
              <FaEnvelope />
              Resend Invite
            </Button>
          ) : (
            <Button
              outline
              onClick={() =>
                changeAdminStatus.mutate({
                  firstName: (item as User).firstName,
                  lastName: (item as User).lastName,
                  role: role === 'admin' ? 'user' : 'admin',
                  id: item.id,
                })
              }
            >
              <FaUserShield />
              {role === 'admin' ? 'Remove Admin' : 'Make Admin'}
            </Button>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="w-full flex py-4">
        <Button color="white" onClick={() => setInviteModalOpen(true)}>
          <FaPlus />
          Invite
        </Button>
      </div>
      {isLoadingUsers || isLoadingInvitations ? (
        <div className="flex w-full flex-col items-center justify-center p-5 min-h-24">
          <Loader />
        </div>
      ) : (
        <ul
          role="list"
          className="w-full divide-y divide-gray-100 border-y border-gray-100"
        >
          {[...users, ...invitations].map(renderUserOrInvitation)}
        </ul>
      )}
      <InviteNewUserModal
        isOpen={inviteModalOpen}
        closeModal={() => setInviteModalOpen(false)}
      />
    </div>
  );
};

export default MyTeamTab;
