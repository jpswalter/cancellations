'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, Title, Text, Flex, ProgressBar } from '@tremor/react';
import { Modal, Button } from '@/components/ui/';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getTenant, updateTenant } from '@/lib/api/tenant';
import { Tenant } from '@/lib/db/schema';
import AUTH_FIELDS from '@/constants/authFields.json';
import { getArticle } from '@/lib/api/article';
import { Loader } from 'lucide-react';

const OrgOnboardingWizard = () => {
  const [step, setStep] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const { userData } = useAuth();
  const totalSteps = useMemo(() => {
    if (userData?.tenantType === 'provider') {
      return 4;
    }
    return 3;
  }, [userData?.tenantType]);

  const { data: org } = useQuery({
    queryKey: ['organization', userData?.tenantId],
    queryFn: () => getTenant(userData?.tenantId),
    enabled: !!userData?.tenantId,
  });

  console.log(org);

  useEffect(() => {
    if (org?.active === false && userData?.role === 'admin') {
      setIsOpen(true);
    }
    if (org?.requiredCustomerInfo) {
      setAuthFields(org.requiredCustomerInfo);
    }
  }, [org, userData?.role]);

  const [authFields, setAuthFields] = useState<string[]>([]);

  const { data: termsConditionsArticle, isLoading: isTermsLoading } = useQuery({
    queryKey: ['terms-and-conditions'],
    queryFn: () => getArticle('terms-and-conditions'),
  });

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Title>Let&apos;s get you set up</Title>
            <Text>
              {userData?.tenantType === 'provider'
                ? 'The onboarding process for your organization means setting up authenticating fields and accepting terms and conditions.'
                : 'The onboarding process for your organization means just accepting terms and conditions.'}
            </Text>
            <Button
              color="indigo"
              onClick={() =>
                setStep(userData?.tenantType === 'provider' ? 2 : 3)
              }
              className="mt-4"
            >
              Get Started
            </Button>
          </>
        );
      case 2:
        return (
          <>
            <Title>Confirm Authenticating Fields</Title>
            <Text>
              We call it &quot;Authenticating Fields&quot; you might call it
              differently, but in a nutshell these are the fields that will be
              used to generate templates for your organization. Companies that
              are using ProxyLink will be required to fill in these fields if
              they want to send Cancellation and other types of requests to your
              organization.
            </Text>
            <div className="mt-2 space-y-2 flex flex-col w-full">
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
            <div className="flex justify-between w-full mt-4">
              <Button outline={true} onClick={() => setStep(1)}>
                Back
              </Button>
              <Button color="indigo" onClick={() => setStep(3)}>
                Proceed
              </Button>
            </div>
          </>
        );
      case 3:
        if (isTermsLoading) return <Loader />;
        return (
          <>
            <Title>{termsConditionsArticle?.title}</Title>
            <div
              className="text-base leading-normal hygraph-content"
              dangerouslySetInnerHTML={{
                __html: termsConditionsArticle?.body?.html ?? '',
              }}
            />
            <Text className="mt-4 text-xl font-semibold text-center">
              Please accept our terms and conditions to continue.
            </Text>
            <Button onClick={handleAcceptTerms} className="mt-2" color="indigo">
              Accept and Continue
            </Button>
          </>
        );
      case 4:
        return (
          <>
            <Title>Congratulations!</Title>
            <Text>
              You successfully completed the onboarding process for{' '}
              <span>{userData?.tenantName}</span> organization on ProxyLink.
            </Text>
            <Button color="indigo" onClick={() => setIsOpen(false)}>
              Finish
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  const mutation = useMutation({
    mutationFn: (data: Tenant) => updateTenant(data),
    onSuccess: () => {
      setStep(currStep => currStep + 1);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAcceptTerms = async () => {
    if (!org) {
      console.error('Organization not found');
      return;
    }
    await mutation.mutate({ ...org, active: true });
  };

  if (!userData || !org || !termsConditionsArticle) return null;

  return (
    <Modal shown={isOpen} title="Welcome to ProxyLink">
      <Card className="max-w-2xl mx-auto">
        <Flex
          flexDirection="col"
          alignItems="center"
          justifyContent="center"
          className="space-y-6"
        >
          <ProgressBar
            value={(step / totalSteps) * 100}
            className="mt-4"
            color="indigo"
          />
          {renderStep()}
        </Flex>
      </Card>
    </Modal>
  );
};

export default OrgOnboardingWizard;
