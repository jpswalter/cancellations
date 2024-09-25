import { FC, useState } from 'react';
import { Radio, RadioGroup, RadioField } from '@/components/ui/radio';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import AUTH_FIELDS from '@/constants/authFields.json';
import { Modal, Button } from '@/components/ui';
import { Card } from '@tremor/react';
import { createOrganization } from '@/lib/api/organization';
import { toast } from 'react-hot-toast';
import { useEmailValidation } from '@/hooks/useEmailValidation';

interface Props {
  isOpen: boolean;
  closeModal: () => void;
}

const CreateOrganizationModal: FC<Props> = ({ isOpen, closeModal }) => {
  const [name, setName] = useState('');
  const [adminEmails, setAdminEmails] = useState('');
  const [orgType, setOrgType] = useState<'proxy' | 'provider'>('provider');
  const [authFields, setAuthFields] = useState<string[]>([]);
  const { emailError, invalidEmails } = useEmailValidation(adminEmails);

  const resetState = () => {
    setName('');
    setAdminEmails('');
    setAuthFields([]);
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: ({ message }) => {
      resetState();
      closeModal();
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: ({ message }) => {
      resetState();
      toast.error(message);
    },
  });

  const handleCreateOrganization = () => {
    if (
      !name ||
      !adminEmails ||
      (orgType === 'provider' && authFields.length === 0)
    ) {
      return;
    }
    mutation.mutate({
      name,
      adminEmails: adminEmails.split(',').map(email => email.trim()),
      orgType,
      authFields,
    });
  };

  const handleOrgTypeChange = (value: string) => {
    if (value === 'proxy' || value === 'provider') {
      setOrgType(value);
    }
  };

  const handleClose = () => {
    resetState();
    closeModal();
  };

  return (
    <Modal
      shown={isOpen}
      onClose={handleClose}
      title="Create New Organization"
      size="lg"
      footer={
        <div className="flex justify-end space-x-4">
          <Button
            color="blue"
            onClick={handleCreateOrganization}
            loading={mutation.isPending}
            disabled={
              !name ||
              !adminEmails ||
              (orgType === 'provider' && !authFields.length) ||
              !!emailError ||
              invalidEmails.length > 0
            }
          >
            Create
          </Button>
          <Button outline onClick={closeModal}>
            Cancel
          </Button>
        </div>
      }
    >
      <div className="space-y-8 py-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-4"
          >
            Organization Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>

        <div>
          <label
            htmlFor="adminEmails"
            className="block text-sm font-medium text-gray-700 mb-4"
          >
            Admin Emails (comma-separated)
          </label>
          <input
            type="text"
            id="adminEmails"
            value={adminEmails}
            onChange={e => setAdminEmails(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Organization Type
          </label>
          <RadioGroup value={orgType} onChange={handleOrgTypeChange}>
            {['provider', 'proxy'].map(value => (
              <Card className="text-sm capitalize" key={value}>
                <RadioField key={value} className="flex items-center gap-2">
                  <Radio value={value} color="blue" />
                  {value}
                </RadioField>
              </Card>
            ))}
          </RadioGroup>
        </div>

        {orgType === 'provider' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Authenticating Fields
            </label>
            <div className="mt-2 space-y-2 flex flex-col">
              {AUTH_FIELDS.map(item => (
                <label key={item.field} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    value={item.field}
                    checked={authFields.includes(item.field)}
                    onChange={e => {
                      if (e.target.checked) {
                        setAuthFields([...authFields, item.field]);
                      } else {
                        setAuthFields(authFields.filter(f => f !== item.field));
                      }
                    }}
                  />
                  <span className="ml-2">{item.display}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CreateOrganizationModal;
