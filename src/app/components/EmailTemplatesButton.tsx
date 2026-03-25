import { Mail } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

/**
 * Quick access button to Email Templates page
 * Visible for all users, but especially useful for owners/developers
 */
export function EmailTemplatesButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to="/email-templates">
            <Button 
              variant="outline" 
              size="icon"
              className="relative group hover:bg-gradient-to-br hover:from-purple-600 hover:to-orange-500 hover:text-white hover:border-transparent transition-all"
            >
              <Mail className="w-5 h-5" />
              <span className="sr-only">Email Templates</span>
              
              {/* Badge indicator */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Email Templates (D-3 & D-1)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
