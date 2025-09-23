import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { auth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface ExpressInterestModalProps {
  flatId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExpressInterestModal = ({ flatId, open, onOpenChange }: ExpressInterestModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleExpressInterest = async (shareContact: boolean) => {
    setIsSubmitting(true);
    try {
      const response = await auth.fetchWithAuth(`/interest/${flatId}?shareContact=${shareContact}`, {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: "Interest expressed successfully!",
          description: shareContact 
            ? "Your contact details have been shared with the owner."
            : "Your interest has been sent without contact details.",
        });
        onOpenChange(false);
      } else {
        throw new Error('Failed to express interest');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to express interest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Express Interest</DialogTitle>
          <DialogDescription>
            Do you want to share your contact details with the flat owner?
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleExpressInterest(false)}
            disabled={isSubmitting}
          >
            No, Don't Share
          </Button>
          <Button
            variant="primary"
            onClick={() => handleExpressInterest(true)}
            disabled={isSubmitting}
          >
            Yes, Share Details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};