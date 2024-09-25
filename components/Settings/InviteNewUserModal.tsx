import { FC, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button } from '@/components/ui';
import { toast } from 'react-hot-toast';
import { inviteUser } from '@/lib/api/user';
import { useAuth } from '@/hooks/useAuth';
import { Invitation } from '@/lib/db/schema';
import { useEmailValidation } from '@/hooks/useEmailValidation';

interface Props {
  isOpen: boolean;
  closeModal: () => void;
}

const InviteUserModal: FC<Props> = ({ isOpen, closeModal }) => {
  const [emails, setEmails] = useState<string>('');
  const { emailError, invalidEmails } = useEmailValidation(emails);
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

  const mutation = useMutation<Invitation, Error, { sendTo: string }>({
    mutationFn: ({ sendTo }) =>
      inviteUser({
        sendTo,
        invitedBy: adminEmail!,
        tenantType: tenantType!,
        tenantName: tenantName!,
        tenantId: tenantId!,
      }),
    onSuccess: () => {
      resetState();
      closeModal();
      toast.success(
        `Invitation${emails.includes(',') ? 's' : ''} sent successfully`,
      );
      if (tenantId) {
        queryClient.invalidateQueries({ queryKey: ['invitations', tenantId] });
      }
    },
    onError: error => {
      toast.error(error.message);
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
      mutation.mutate({ sendTo: newUserEmail.trim() });
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
            disabled={
              emails.length === 0 || !!emailError || invalidEmails.length > 0
            }
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
          htmlFor="emails"
          className="block text-base font-medium text-gray-500 mb-2 pl-2"
        >
          Emails (comma-separated)
        </label>
        <input
          type="text"
          id="emails"
          value={emails}
          onChange={e => setEmails(e.target.value)}
          className="text-black w-full rounded-md border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        />
        {emailError && (
          <p className="mt-2 text-sm text-red-600">{emailError}</p>
        )}
        {invalidEmails.length > 0 && (
          <p className="mt-2 text-sm text-red-600">
            Invalid email(s): {invalidEmails.join(', ')}
          </p>
        )}
      </div>
    </Modal>
  );
};

export default InviteUserModal;
