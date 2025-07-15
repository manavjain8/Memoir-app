import React, { useState } from 'react';
import { UserTypeSelection } from './UserTypeSelection';
import { AccountSelection } from './AccountSelection';
import { CaregiverSetup } from './CaregiverSetup';
import { ProfileSetup } from './ProfileSetup';
import { SettingsSetup } from './SettingsSetup';
import { WelcomeScreen } from './WelcomeScreen';

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState<'user' | 'caregiver' | null>(null);
  const [accountType, setAccountType] = useState<'new' | 'existing' | null>(null);

  const steps = [
    <WelcomeScreen key="welcome" onNext={() => setCurrentStep(1)} />,
    <UserTypeSelection 
      key="user-type" 
      onSelect={(type) => {
        setUserType(type);
        setCurrentStep(2);
      }} 
    />,
    <AccountSelection
      key="account-selection"
      userType={userType!}
      onContinue={() => {
        setAccountType('new');
        if (userType === 'caregiver') {
          setCurrentStep(3); // Go to caregiver setup
        } else {
          setCurrentStep(4); // Go to profile setup for regular users
        }
      }}
      onBack={() => setCurrentStep(1)}
    />,
    <CaregiverSetup
      key="caregiver-setup"
      onNext={() => setCurrentStep(5)} // Go to settings setup
    />,
    <ProfileSetup 
      key="profile" 
      userType={userType!}
      onNext={() => setCurrentStep(5)} 
    />,
    <SettingsSetup 
      key="settings" 
      userType={userType!}
      onComplete={() => {
        // Onboarding complete - this will be handled by the parent component
      }} 
    />
  ];

  // Skip certain steps based on user type and account type
  const getStepToShow = () => {
    if (currentStep === 3 && userType !== 'caregiver') {
      return 4; // Skip caregiver setup for regular users
    }
    if (currentStep === 4 && userType === 'caregiver') {
      return 5; // Skip profile setup for caregivers
    }
    return currentStep;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {steps[getStepToShow()]}
    </div>
  );
}