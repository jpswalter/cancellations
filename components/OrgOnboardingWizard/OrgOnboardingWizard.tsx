'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Title, Text, Flex, ProgressBar } from '@tremor/react';
import { Modal, Button } from '@/components/ui/';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getTenant, updateTenant } from '@/lib/api/tenant';
import { CustomerInfoField, Tenant } from '@/lib/db/schema';
import AUTH_FIELDS from '@/constants/authFields.json';
import { getArticle } from '@/lib/api/article';
import { Loader } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const OrgOnboardingWizard = () => {
  const [step, setStep] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const { userData } = useAuth();

  const { data: org } = useQuery({
    queryKey: ['organization', userData?.tenantId],
    queryFn: () => getTenant(userData?.tenantId),
    enabled: !!userData?.tenantId,
  });

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

  const [termsConditionsAccepted, setTermsConditionsAccepted] = useState(false);

  const getCurrentProgress = useCallback(() => {
    const isProvider = userData?.tenantType === 'provider';
    const totalSteps = isProvider ? 4 : 3;
    if (isProvider) {
      return (step / totalSteps) * 100;
    }
    return step === 1 ? 33 : step === 2 ? 33 : step === 3 ? 66 : 100;
  }, [userData?.tenantType, step]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h3 className="text-3xl">Let&apos;s get you set up</h3>
            <p className="text-center">
              {userData?.tenantType === 'provider'
                ? 'The onboarding process for your organization means setting up authenticating fields and accepting terms and conditions.'
                : 'The onboarding process for your organization means just accepting terms and conditions.'}
            </p>
            <Button
              color="indigo"
              onClick={() =>
                setStep(userData?.tenantType === 'provider' ? 2 : 3)
              }
              className="mt-2"
            >
              Get Started
            </Button>
          </>
        );
      case 2:
        return (
          <div className="flex flex-col h-full">
            <h3 className="text-3xl mb-4">Confirm Authenticating Fields</h3>
            <p className="text-left mb-4">
              These &quot;Authenticating Fields&quot; are essential details
              we&apos;ll use to verify customer requests. When ProxyLink users
              upload CSVs with cancellations or other requests, we&apos;ll use
              these fields to create templates they must complete. to create
              templates they must complete.
            </p>
            <div
              className="flex-grow overflow-y-auto mb-4"
              style={{ maxHeight: 'calc(80vh - 300px)' }}
            >
              <div className="space-y-2 flex flex-col w-full">
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
                          setAuthFields(
                            authFields.filter(f => f !== item.field),
                          );
                        }
                      }}
                    />
                    <span className="ml-2">{item.display}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-between w-full mt-auto">
              <Button outline={true} onClick={() => setStep(1)}>
                Back
              </Button>
              <Button color="indigo" onClick={() => setStep(3)}>
                Proceed
              </Button>
            </div>
          </div>
        );
      case 3:
        if (isTermsLoading) return <Loader />;
        return (
          <div className="flex flex-col h-full">
            <h3 className="text-3xl mb-4 text-center">
              {termsConditionsArticle?.title}
            </h3>
            <div
              className="flex-grow overflow-y-auto mb-4"
              style={{ maxHeight: 'calc(80vh - 200px)' }}
            >
              <div
                className="text-base leading-normal hygraph-content"
                dangerouslySetInnerHTML={{
                  __html: termsConditionsArticle?.body?.html ?? '',
                }}
              />
            </div>
            <div className="mt-auto">
              <div className="flex space-x-2 w-full mb-4">
                <Checkbox
                  checked={termsConditionsAccepted}
                  onChange={() =>
                    setTermsConditionsAccepted(!termsConditionsAccepted)
                  }
                />
                <Text>Please accept our terms and conditions.</Text>
              </div>
              <div className="flex justify-between w-full">
                <Button outline={true} onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={handleAcceptTerms}
                  color="indigo"
                  disabled={!termsConditionsAccepted}
                  loading={activateTenantMutation.isPending}
                >
                  Accept and Continue
                </Button>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <>
            <div className="text-6xl">🎉</div>
            <Title>Congratulations!</Title>
            <p className="text-center">
              You successfully completed the onboarding process for{' '}
              <span>{userData?.tenantName}</span> organization on ProxyLink.
            </p>
            <Button color="indigo" onClick={() => setIsOpen(false)}>
              Finish
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  const activateTenantMutation = useMutation({
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
    await activateTenantMutation.mutate({
      ...org,
      active: true,
      ...(userData?.tenantType === 'provider'
        ? { requiredCustomerInfo: authFields as CustomerInfoField[] }
        : {}),
    });
  };

  if (!userData || !org || !termsConditionsArticle) return null;

  return (
    <Modal shown={isOpen} title="" size="lg">
      <Card className="w-full max-h-[80vh] h-full flex flex-col overflow-hidden p-0">
        <Flex
          flexDirection="col"
          alignItems="center"
          justifyContent="start"
          className="h-full"
        >
          <ProgressBar
            value={getCurrentProgress()}
            className="w-full mb-6"
            color="indigo"
          />
          <div className="w-full overflow-y-auto flex-grow flex flex-col items-center gap-4 px-4">
            {renderStep()}
          </div>
        </Flex>
      </Card>
    </Modal>
  );
};

export default OrgOnboardingWizard;
