import React from 'react';
import zxcvbn from 'zxcvbn';

interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const result = zxcvbn(password);
  const score = result.score;
  const suggestions = result.feedback.suggestions;

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0:
        return 'Very Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-blue-500';
      case 4:
        return 'bg-green-500';
      default:
        return '';
    }
  };

  const strengthLabel = getStrengthLabel(score);
  const strengthColor = getStrengthColor(score);

  return (
    <div className="mt-2">
      <div className="h-2 w-full bg-gray-200 rounded-full">
        <div
          className={`h-full ${strengthColor} rounded-full`}
          style={{ width: `${(score / 4) * 100}%` }}
        ></div>
      </div>
      {strengthLabel && (
        <div className="mt-1 text-sm text-gray-600">
          Strength: {strengthLabel}
        </div>
      )}
      {suggestions.length > 0 && (
        <ul className="mt-1 text-sm text-gray-600">
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
