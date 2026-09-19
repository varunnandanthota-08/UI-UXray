import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { LayoutDashboard, Clock } from 'lucide-react';

export const FacilitatorPlaceholder = ({ title = 'Facilitator Module', description = 'This module is scheduled for development in subsequent milestones.' }) => {
  const location = useLocation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="blue" size="sm">
              FACILITATOR WORKSPACE
            </Badge>
            <span className="text-xs text-brand-text-secondary">
              Route: {location.pathname}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-text-primary tracking-tight">
            {title}
          </h1>
          <p className="text-xs md:text-sm text-brand-text-secondary mt-1 max-w-xl">
            {description}
          </p>
        </div>

        <Link to="/facilitator/dashboard">
          <Button variant="primary" size="md" icon={LayoutDashboard} iconPosition="left">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="p-8 md:p-12 text-center space-y-4 max-w-xl mx-auto shadow-soft">
        <div className="w-12 h-12 rounded-2xl bg-brand-yellow-light text-brand-warning mx-auto flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-brand-text-primary">
            {title} Foundation Ready
          </h3>
          <p className="text-xs text-brand-text-secondary leading-relaxed">
            The navigation structure and facilitator routing space are established. Specific workflows for this module will be introduced in subsequent FE-1 tasks.
          </p>
        </div>
        <Link to="/facilitator/dashboard">
          <Button variant="outline" size="sm" className="mt-2">
            Return to Mentor Dashboard
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default FacilitatorPlaceholder;
