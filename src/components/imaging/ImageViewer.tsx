import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';

interface ImageViewerProps {
  imageUrl: string;
  annotations?: any[];
}

export function ImageViewer({ imageUrl, annotations = [] }: ImageViewerProps) {
  return (
    <div className="relative w-full h-[600px] bg-slate-900 rounded-lg overflow-hidden">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button size="icon" variant="secondary">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary">
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary">
          <Download className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="w-full h-full flex items-center justify-center">
        <img 
          src={imageUrl} 
          alt="Radiografia" 
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
}
