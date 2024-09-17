import { FieldGroup, Fieldset, Label, Field } from '@/components/ui/fieldset';
import { Input } from '@/components/ui/input';
import { User } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { FC, useState } from 'react';
import { updateUser } from '@/lib/api/user';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import Spinner from '../ui/spinner';

const MyAccountTab: FC<{
  userData: User;
  tenantName?: string;
}> = ({ userData, tenantName }) => {
  const [firstName, setFirstName] = useState(userData.firstName);
  const [lastName, setLastName] = useState(userData.lastName);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      firstName,
      lastName,
    }: {
      firstName: string;
      lastName: string;
    }) =>
      updateUser({
        firstName,
        lastName,
        id: userData.id,
        role: userData.role,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('User updated successfully', {
        duration: 2000,
      });
    },
    onError: error => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });

  const handleSaveName = () => {
    mutation.mutate({
      firstName,
      lastName,
    });
  };

  if (!userData.email) {
    return null;
  }

  return (
    <div className="h-full w-full py-8">
      <Fieldset>
        <FieldGroup>
          <div className="flex gap-4 items-center">
            <Field className="w-fit">
              <Label>First Name</Label>
              <div className="flex gap-x-2">
                <Input
                  name="firstName"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </div>
            </Field>
            <Field className="w-fit">
              <Label>Last Name</Label>
              <div className="flex gap-x-2">
                <Input
                  name="lastName"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
                <Button onClick={handleSaveName}>
                  {mutation.isPending ? <Spinner color="white" /> : 'Save'}
                </Button>
              </div>
            </Field>
          </div>
        </FieldGroup>
        <FieldGroup>
          <Field className="w-fit">
            <Label>Email</Label>
            <Input name="email" disabled value={userData.email} />
          </Field>
        </FieldGroup>
        <FieldGroup>
          <Field className="w-fit">
            <Label>Organization</Label>
            <Input name="email" disabled value={tenantName} />
          </Field>
        </FieldGroup>
      </Fieldset>
    </div>
  );
};

export default MyAccountTab;
