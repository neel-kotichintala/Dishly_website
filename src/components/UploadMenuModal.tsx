import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, MapPin } from 'lucide-react';

interface UploadMenuModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit?: (payload: { restaurant: string; file: File }) => void;
}

const PLACES_KEY = import.meta.env.VITE_GOOGLE_MAPS_JS_API_KEY as string | undefined;

export const UploadMenuModal: React.FC<UploadMenuModalProps> = ({ open, onOpenChange, onSubmit }) => {
  const [restaurant, setRestaurant] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    if (!PLACES_KEY) return;
    if (!inputRef.current) return;

    // Load Places Autocomplete via script tag once
    const id = 'gmaps-places';
    if (!document.getElementById(id)) {
      const s = document.createElement('script');
      s.id = id;
      s.src = `https://maps.googleapis.com/maps/api/js?key=${PLACES_KEY}&libraries=places&v=weekly`;
      s.async = true;
      s.onload = () => initAutocomplete();
      document.body.appendChild(s);
    } else {
      initAutocomplete();
    }

    function initAutocomplete() {
      try {
        const google = (window as any).google;
        if (!google || !google.maps || !google.maps.places) return;
        const ac = new google.maps.places.Autocomplete(inputRef.current!, { types: ['establishment'] });
        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          setRestaurant(place?.name || restaurant);
        });
      } catch {}
    }
  }, [open]);

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    const onDragOver = (e: DragEvent) => { e.preventDefault(); el.classList.add('ring-2', 'ring-primary'); };
    const onDragLeave = () => { el.classList.remove('ring-2', 'ring-primary'); };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      el.classList.remove('ring-2', 'ring-primary');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        setFile(e.dataTransfer.files[0]);
      }
    };

    el.addEventListener('dragover', onDragOver as any);
    el.addEventListener('dragleave', onDragLeave as any);
    el.addEventListener('drop', onDrop as any);
    return () => {
      el.removeEventListener('dragover', onDragOver as any);
      el.removeEventListener('dragleave', onDragLeave as any);
      el.removeEventListener('drop', onDrop as any);
    };
  }, [dropRef.current]);

  const handleBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = () => {
    if (restaurant && file) onSubmit?.({ restaurant, file });
    onOpenChange(false);
    setFile(null);
    setRestaurant('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload a Restaurant Menu</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="restaurant">Restaurant</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="restaurant"
                ref={inputRef}
                placeholder={PLACES_KEY ? 'Search restaurants…' : 'Restaurant name'}
                className="pl-10"
                value={restaurant}
                onChange={(e) => setRestaurant(e.target.value)}
              />
            </div>
            {!PLACES_KEY && (
              <p className="text-[11px] text-muted-foreground">Tip: Add VITE_GOOGLE_MAPS_JS_API_KEY to enable Google Places suggestions.</p>
            )}
          </div>

          <div
            ref={dropRef}
            className="border rounded-md p-6 bg-muted/30 text-center cursor-pointer"
            onClick={() => document.getElementById('menu-file-input')?.click()}
          >
            <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm mt-2">Drag & drop menu image/PDF here, or click to browse</p>
            <input id="menu-file-input" type="file" accept="image/*,application/pdf" className="hidden" onChange={handleBrowse} />
            {file && (
              <p className="text-xs text-muted-foreground mt-2">Selected: {file.name}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant="hero" disabled={!restaurant || !file} onClick={handleSubmit}>Submit</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
