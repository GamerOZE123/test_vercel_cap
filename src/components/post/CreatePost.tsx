
import React, { useState } from 'react';
import { Image, MapPin, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function CreatePost() {
  const [content, setContent] = useState('');

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-white">JD</span>
        </div>
        <div className="flex-1">
          <Textarea
            placeholder="What's happening in your university?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none bg-transparent border-none p-0 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
          />
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted/50">
                <Image className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted/50">
                <MapPin className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted/50">
                <Smile className="w-5 h-5" />
              </Button>
            </div>
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!content.trim()}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
