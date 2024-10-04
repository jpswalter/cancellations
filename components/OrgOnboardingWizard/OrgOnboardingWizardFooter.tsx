import { Button } from '@/components/ui/';

interface OrgOnboardingWizardFooterProps {
  step: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onFinish: () => void;
  isLastStep: boolean;
  isFirstStep: boolean;
  termsAccepted: boolean;
  onAcceptTerms: () => void;
  isLoading: boolean;
}

const OrgOnboardingWizardFooter: React.FC<OrgOnboardingWizardFooterProps> = ({
  step,
  totalSteps,
  onNext,
  onPrevious,
  onFinish,
  isLastStep,
  isFirstStep,
  termsAccepted,
  onAcceptTerms,
  isLoading,
}) => {
  if (isLastStep) {
    return (
      <Button color="indigo" onClick={onFinish}>
        Finish
      </Button>
    );
  }

  const isTermsStep = step === totalSteps - 1;

  return (
    <div className="flex justify-between w-full">
      {!isFirstStep && (
        <Button outline={true} onClick={onPrevious}>
          Back
        </Button>
      )}
      <div className="flex-grow" />
      {isTermsStep ? (
        <Button
          onClick={onAcceptTerms}
          color="indigo"
          disabled={!termsAccepted}
          loading={isLoading}
        >
          Accept and Continue
        </Button>
      ) : (
        <Button color="indigo" onClick={onNext}>
          {isFirstStep ? 'Get Started' : 'Proceed'}
        </Button>
      )}
    </div>
  );
};

export default OrgOnboardingWizardFooter;
