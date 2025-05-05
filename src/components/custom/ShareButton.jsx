import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share, Copy, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  EmailShareButton,
} from 'react-share';

const ShareButton = ({ tripId, tripData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const shareUrl = `${window.location.origin}/view-trip/${tripId}`;
  const title = `Check out my trip to ${tripData?.destination || 'this amazing place'}!`;

  const handleShare = () => {
    setIsOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  // Use Web Share API if available
  const nativeShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: title,
          text: 'Check out this awesome trip plan!',
          url: shareUrl,
        })
        .then(() => toast.success('Shared successfully'))
        .catch((error) => console.error('Error sharing:', error));
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={nativeShare}
        className="flex items-center gap-2"
      >
        <Share size={18} />
        Share
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share your trip plan</DialogTitle>
            <DialogDescription>
              Anyone with this link can view your trip plan
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center space-x-2 mt-4">
            <Input value={shareUrl} readOnly className="flex-1" />
            <Button 
              size="icon" 
              onClick={copyToClipboard} 
              title="Copy link"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <FacebookShareButton url={shareUrl} quote={title}>
              <Button size="icon" variant="outline" title="Share on Facebook">
                <Facebook className="h-4 w-4" />
              </Button>
            </FacebookShareButton>

            <TwitterShareButton url={shareUrl} title={title}>
              <Button size="icon" variant="outline" title="Share on Twitter">
                <Twitter className="h-4 w-4" />
              </Button>
            </TwitterShareButton>

            <LinkedinShareButton url={shareUrl} title={title}>
              <Button size="icon" variant="outline" title="Share on LinkedIn">
                <Linkedin className="h-4 w-4" />
              </Button>
            </LinkedinShareButton>

            <EmailShareButton url={shareUrl} subject={title} body="Check out this trip plan I created:">
              <Button size="icon" variant="outline" title="Share via Email">
                <Mail className="h-4 w-4" />
              </Button>
            </EmailShareButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareButton; 