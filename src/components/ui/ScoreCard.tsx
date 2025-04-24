
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ScoreCardProps {
  label: string;
  score: number;
  icon: React.ReactNode;
  description?: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ label, score, icon, description }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-civic-green';
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-amber-500';
    if (score >= 30) return 'text-orange-500';
    return 'text-civic-red';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-civic-green';
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    if (score >= 30) return 'bg-orange-500';
    return 'bg-civic-red';
  };

  // Validate and sanitize score
  const validScore = typeof score === 'number' && !isNaN(score) && isFinite(score)
    ? Math.min(100, Math.max(0, Math.round(score))) 
    : 0;

  // Add debug output for score validation
  if (typeof score !== 'number' || isNaN(score) || !isFinite(score)) {
    console.warn(`ScoreCard received invalid score for ${label}: ${score} (type: ${typeof score})`);
  }

  return (
    <div className="card">
      <div className="flex items-center mb-2">
        <div className="text-civic-gray-700 mr-2">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-civic-gray-900">{label}</h3>
      </div>
      
      <div className="flex items-baseline mt-1 mb-2">
        <span className={`text-3xl font-bold ${getScoreColor(validScore)}`}>{validScore}</span>
        <span className="text-civic-gray-500 ml-1">/100</span>
      </div>
      
      <Progress value={validScore} className="h-2 mb-3">
        <div className={`h-full ${getProgressColor(validScore)} rounded-full`} style={{ width: `${validScore}%` }} />
      </Progress>
      
      {description && (
        <p className="text-sm text-civic-gray-600 mt-2">{description}</p>
      )}
    </div>
  );
};

export default ScoreCard;
