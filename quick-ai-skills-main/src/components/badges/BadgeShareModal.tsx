import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, Download, Copy, Trophy, Star, Award, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Certificate {
  id: string;
  title: string;
  trackId: string;
  trackName: string;
  issuedAt: Date;
  level: "bronze" | "silver" | "gold";
  shareLink: string;
  badgeImageUrl: string;
}

interface BadgeShareModalProps {
  certificate: Certificate;
  trigger?: React.ReactNode;
}

export const BadgeShareModal = ({ certificate, trigger }: BadgeShareModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(certificate.shareLink);
      toast({
        title: "Link copied!",
        description: "Certificate link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually",
        variant: "destructive"
      });
    }
  };

  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificate.shareLink)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
    
    // Track analytics event
    console.log('badge_share_click', { platform: 'linkedin', certificateId: certificate.id });
  };

  const handleNotionShare = () => {
    // In a real app, this would integrate with Notion API
    const notionTemplate = `🏆 **${certificate.title}**\n\nI just earned this AI skills certificate!\n\n**Track:** ${certificate.trackName}\n**Level:** ${certificate.level.toUpperCase()}\n**Issued:** ${certificate.issuedAt.toLocaleDateString()}\n\nView certificate: ${certificate.shareLink}`;
    
    navigator.clipboard.writeText(notionTemplate);
    toast({
      title: "Notion template copied!",
      description: "Paste this into your Notion page",
    });
    
    console.log('badge_share_click', { platform: 'notion', certificateId: certificate.id });
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "gold": return <Trophy className="w-5 h-5 text-yellow-500" />;
      case "silver": return <Award className="w-5 h-5 text-gray-400" />;
      default: return <Star className="w-5 h-5 text-amber-600" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "gold": return "from-yellow-400 to-yellow-600";
      case "silver": return "from-gray-300 to-gray-500";
      default: return "from-amber-400 to-amber-600";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share Badge
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Achievement
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Certificate Preview */}
          <Card className={`bg-gradient-to-br ${getLevelColor(certificate.level)} text-white shadow-glow`}>
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                {getLevelIcon(certificate.level)}
              </div>
              <h3 className="text-lg font-bold mb-2">{certificate.title}</h3>
              <p className="text-sm opacity-90 mb-3">{certificate.trackName}</p>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {certificate.level.toUpperCase()} Level
              </Badge>
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-xs opacity-75">
                  Issued on {certificate.issuedAt.toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Share Options */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Share your achievement:</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleLinkedInShare}
                className="bg-[#0077B5] hover:bg-[#0077B5]/90 text-white border-0"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
              
              <Button 
                onClick={handleNotionShare}
                variant="outline"
                className="border-gray-300 hover:border-gray-400"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Notion
              </Button>
            </div>

            {/* Share Link */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Direct link:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={certificate.shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border border-input bg-background rounded-md"
                />
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Download Option */}
            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Certificate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};