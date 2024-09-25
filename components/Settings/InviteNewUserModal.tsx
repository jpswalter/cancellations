import { FC, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button } from '@/components/ui';
import { toast } from 'react-hot-toast';
import { inviteUser } from '@/lib/api/user';
import { useAuth } from '@/hooks/useAuth';
import { Invitation } from '@/lib/db/schema';
interface Props {
  isOpen: boolean;
  closeModal: () => void;
}

const InviteUserModal: FC<Props> = ({ isOpen, closeModal }) => {
  const [emails, setEmails] = useState<string>('');
  const { userData } = useAuth();
  const {
    tenantType,
    tenantName,
    tenantId,
    email: adminEmail,
  } = userData || {};

  const resetState = () => {
    setEmails('');
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: inviteUser,
    onSuccess: invitation => {
      resetState();
      closeModal();
      toast.success(
        `Invitation to ${(invitation as Invitation).email} sent successfully`,
      );
      queryClient.invalidateQueries({ queryKey: ['users', 'invitations'] });
    },
    onError: ({ message }) => {
      resetState();
      toast.error(message);
    },
  });

  const handleClose = () => {
    resetState();
    closeModal();
  };

  const handleInvite = () => {
    if (!tenantType || !tenantName || !tenantId || !adminEmail) {
      toast.error('Organization data is missing');
      return;
    }

    emails.split(',').forEach(newUserEmail => {
      mutation.mutate({
        sendTo: newUserEmail,
        invitedBy: adminEmail,
        tenantType,
        tenantName,
        tenantId,
      });
    });
  };

  return (
    <Modal
      shown={isOpen}
      onClose={handleClose}
      title="Invite New Users"
      size="lg"
      footer={
        <div className="flex justify-end space-x-4">
          <Button
            color="blue"
            onClick={handleInvite}
            loading={mutation.isPending}
            disabled={emails.length === 0}
          >
            Invite
          </Button>
          <Button outline onClick={closeModal}>
            Cancel
          </Button>
        </div>
      }
      data-testid="invite-user-modal"
    >
      <div className="py-4">
        <h3 className="text-lg text-gray-900 mb-4">
          Invite users to join the {tenantName} organization on ProxyLink
        </h3>
        <label
          htmlFor="adminEmails"
          className="block text-sm font-medium text-gray-700"
        >
          Emails (comma-separated)
        </label>
        <input
          type="text"
          id="emails"
          value={emails}
          onChange={e => setEmails(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        />
      </div>
    </Modal>
  );
};

export default InviteUserModal;
