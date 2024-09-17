import { getUsers, updateUser } from '@/lib/api/user';
import { formatDate } from '@/utils/general';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { FC, useState } from 'react';
import { FaPlus, FaUserShield } from 'react-icons/fa';
import toast from 'react-hot-toast';
import InviteNewUserModal from './InviteNewUserModal';

const MyTeamTab: FC<{ tenantId: string }> = ({ tenantId }) => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers({ tenantId }),
  });

  const queryClient = useQueryClient();
  const makeAdmin = useMutation({
    mutationFn: ({
      firstName,
      lastName,
      role,
      id,
    }: {
      firstName: string;
      lastName: string;
      role: 'admin';
      id: string;
    }) =>
      updateUser({
        firstName,
        lastName,
        id,
        role,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`User updated successfully`, {
        duration: 2000,
      });
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (users instanceof Error) {
    return (
      <div className="flex w-full flex-col items-center justify-center p-5">
        Error: {users.message}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="w-full flex py-4">
        <Button color="white" onClick={() => setInviteModalOpen(true)}>
          <FaPlus />
          Invite
        </Button>
      </div>
      <ul
        role="list"
        className="w-full divide-y divide-gray-100 border-y border-gray-100"
      >
        {users?.map(({ email, firstName, lastName, createdAt, role, id }) => (
          <li key={email} className="flex py-5 justify-between items-center">
            <div className="flex shrink-0 gap-x-4">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-xl font-bold text-gray-600">
                {firstName?.charAt(0).toUpperCase() +
                  lastName?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-auto">
                <div className="flex items-center gap-4">
                  <p className="text-md font-semibold leading-6 text-gray-900">
                    {firstName} {lastName}
                  </p>
                  <Badge
                    className="shrink-0"
                    color={role === 'admin' ? 'fuchsia' : 'sky'}
                  >
                    <div className="text-md shrink-0 break-keep">
                      {role === 'admin' ? 'Admin' : 'User'}
                    </div>
                  </Badge>
                </div>
                <p className="mt-1 truncate text-sm leading-5 text-gray-500">
                  {email} · Added {formatDate(createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {role === 'user' && (
                <Button
                  outline
                  onClick={() =>
                    makeAdmin.mutate({ firstName, lastName, role: 'admin', id })
                  }
                >
                  <FaUserShield />
                  Make admin
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <InviteNewUserModal
        isOpen={inviteModalOpen}
        closeModal={() => setInviteModalOpen(false)}
      />
    </div>
  );
};

export default MyTeamTab;
