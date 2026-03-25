import { Smartphone } from 'lucide-react';

interface EmailMobilePreviewProps {
  children: React.ReactNode;
  title: string;
}

/**
 * Mobile Device Frame for Email Preview
 * Simulates how email looks on mobile devices
 */
export function EmailMobilePreview({ children, title }: EmailMobilePreviewProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-600">
        <Smartphone className="w-4 h-4" />
        <span>Mobile Preview (375px)</span>
      </div>
      
      {/* Mobile Device Frame */}
      <div className="relative">
        {/* Device Border */}
        <div 
          className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl"
          style={{ width: '375px' }}
        >
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10"></div>
          
          {/* Screen */}
          <div className="bg-white rounded-[2.5rem] overflow-hidden relative">
            {/* Status Bar */}
            <div className="bg-white px-6 py-2 flex justify-between items-center text-xs font-semibold border-b border-gray-100">
              <span>9:41</span>
              <span className="text-gray-400">📶 📶 📶 100%</span>
            </div>

            {/* Email Client Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="text-xs text-gray-500 mb-1">От: SubManager</div>
              <div className="text-sm font-semibold text-gray-900 truncate">{title}</div>
            </div>

            {/* Email Content - Scrollable */}
            <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
              <div className="scale-[0.95] origin-top">
                {children}
              </div>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
