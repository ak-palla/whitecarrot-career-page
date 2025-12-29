'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Building2, Briefcase, User, DollarSign, Calendar } from 'lucide-react';
import { Job } from '@/lib/types/job';

interface JobDetailsModalProps {
  job: Job & { requirements?: string | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyClick?: (jobId: string) => void;
}

export function JobDetailsModal({ job, open, onOpenChange, onApplyClick }: JobDetailsModalProps) {
  const formatJobType = (jobType: string | null | undefined): string => {
    if (!jobType) return '';
    return jobType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleApplyClick = () => {
    if (onApplyClick) {
      onApplyClick(job.id);
    } else {
      // Fallback: close details modal (for backward compatibility)
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold text-black pr-8">{job.title}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {/* Metadata Section */}
            <div className="flex flex-wrap gap-3 items-center">
              {job.location && (
                <Badge variant="secondary" className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </Badge>
              )}
              {job.job_type && (
                <Badge variant="secondary" className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatJobType(job.job_type)}
                </Badge>
              )}
              {job.team && (
                <Badge variant="secondary" className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {job.team}
                </Badge>
              )}
              {job.work_policy && (
                <Badge variant="secondary" className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  {job.work_policy}
                </Badge>
              )}
              {job.employment_type && (
                <Badge variant="secondary" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {job.employment_type}
                </Badge>
              )}
              {job.experience_level && (
                <Badge variant="secondary">
                  {job.experience_level}
                </Badge>
              )}
            </div>

            {/* Salary and Expiry Info */}
            {(job.salary_range || job.expires_at) && (
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {job.salary_range && (
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      {job.salary_range}
                      {job.currency && ` ${job.currency}`}
                    </span>
                  </div>
                )}
                {job.expires_at && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>Expires: {new Date(job.expires_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Description Section */}
            {job.description && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-black">Job Description</h3>
                <div 
                  className="text-black [&_p]:mb-3 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-1 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_strong]:font-semibold [&_em]:italic"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </div>
            )}

            {/* Requirements Section */}
            {job.requirements && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-black">Requirements</h3>
                <div 
                  className="text-black [&_p]:mb-3 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-1 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_strong]:font-semibold [&_em]:italic"
                  dangerouslySetInnerHTML={{ __html: job.requirements }}
                />
              </div>
            )}
          </div>

          {/* Action Section */}
          <div className="flex-shrink-0 pt-4 border-t flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleApplyClick} className="min-w-[120px]">
              Apply Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
}

