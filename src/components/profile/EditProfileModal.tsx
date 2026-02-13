import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from '@animaapp/playground-react-sdk';
import { useMockMutation } from '@/hooks/useMockMutation';
import { isMockMode } from '@/utils/mockMode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AvatarImage } from '@/components/ui/AvatarImage';
import { Camera, Loader2, X } from 'lucide-react';
import type { UserProfile } from '@/types/schema';

interface EditProfileModalProps {
  onClose: () => void;
  initialProfile: UserProfile | null;
  onSave?: () => void;
}

export default function EditProfileModal({ onClose, initialProfile, onSave }: EditProfileModalProps) {
  const { toast } = useToast();
  
  // Auth
  const { user } = useAuth();

  const realMutation = isMockMode() ? null : useMutation('UserProfile');
  const mockMutation = isMockMode() ? useMockMutation('UserProfile') : null;
  const { create, update } = (isMockMode() ? mockMutation : realMutation)!;

  const [isSaving, setIsSaving] = useState(false);
  const [tempProfileImage, setTempProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    website: '',
    email: '',
  });

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (tempProfileImage) {
        URL.revokeObjectURL(tempProfileImage);
      }
    };
  }, [tempProfileImage]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Scroll lock effect
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Initialize form data from props and auth user
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        username: initialProfile?.username || (user as any).username || user.email?.split('@')[0] || '',
        bio: initialProfile?.bio || (user as any).bio || '',
        website: initialProfile?.website || (user as any).website || '',
      });
    }
  }, [user, initialProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);

    try {
      let profilePictureUrl = initialProfile?.profilePictureUrl;

      // If a new image was selected, "upload" it (convert to Base64 for persistence)
      if (selectedFile) {
        profilePictureUrl = await convertToBase64(selectedFile);
      }

      // 1. Update UserProfile Entity
      if (initialProfile) {
        await update(initialProfile.id, {
          username: formData.username,
          bio: formData.bio,
          website: formData.website,
          profilePictureUrl,
        });
      } else {
        await create({
          userId: user.id,
          username: formData.username,
          bio: formData.bio,
          website: formData.website,
          profilePictureUrl,
        });
      }

      // Clear temporary state
      if (tempProfileImage) {
        URL.revokeObjectURL(tempProfileImage);
        setTempProfileImage(null);
      }
      setSelectedFile(null);

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      if (onSave) onSave();
      onClose();
    } catch (error) {
      console.error('Save Failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="w-full max-w-2xl bg-background rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] m-4 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-h3 font-bold text-foreground">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-tertiary rounded-full transition-colors text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div className="flex items-center gap-6 p-6 bg-tertiary/30 border border-border rounded-lg">
              <div className="relative">
                <div className="w-20 h-20 aspect-square rounded-full overflow-hidden bg-tertiary border border-border">
                  <AvatarImage
                    key={tempProfileImage || initialProfile?.profilePictureUrl}
                    src={tempProfileImage || initialProfile?.profilePictureUrl || (user as any)?.profilePictureUrl}
                    alt="Profile"
                    className="w-full h-full"
                  />
                </div>
                <label
                  htmlFor="profile-photo-upload"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-primary text-primary-foreground rounded-full flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Camera className="w-4 h-4" />
                  <input
                    id="profile-photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.target.files?.[0];
                      if (file) {
                        const objectUrl = URL.createObjectURL(file);
                        setTempProfileImage(objectUrl);
                        setSelectedFile(file);
                        toast({
                          title: 'Photo Selected',
                          description: 'Don\'t forget to save your changes.',
                        });
                      }
                    }}
                  />
                </label>
              </div>
              <div>
                <p className="text-body font-semibold text-foreground">
                  {formData.username || user?.email}
                </p>
                <p className="text-caption text-tertiary-foreground">Change profile photo</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-body-sm font-semibold text-foreground mb-2 block">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-10"
                  disabled={isSaving}
                />
              </div>

              <div>
                <Label htmlFor="username" className="text-body-sm font-semibold text-foreground mb-2 block">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="h-10"
                  disabled={isSaving}
                />
              </div>

              <div>
                <Label htmlFor="bio" className="text-body-sm font-semibold text-foreground mb-2 block">
                  Bio
                </Label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => {
                    if (e.target.value.length <= 300) {
                      setFormData({ ...formData, bio: e.target.value });
                    }
                  }}
                  className="w-full min-h-24 px-4 py-3 border border-border rounded-md bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-normal resize-none disabled:opacity-50"
                  maxLength={300}
                  disabled={isSaving}
                />
                <div className="flex justify-end mt-1">
                  <p className={`text-caption ${formData.bio.length >= 300 ? 'text-error' : 'text-tertiary-foreground'}`}>
                    {formData.bio.length}/300
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="website" className="text-body-sm font-semibold text-foreground mb-2 block">
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="h-10"
                  disabled={isSaving}
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-body-sm font-semibold text-foreground mb-2 block">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled={true}
                  className="h-10 bg-tertiary text-tertiary-foreground cursor-not-allowed"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-background flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="border-border hover:bg-tertiary"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-profile-form"
            disabled={isSaving}
            className="bg-gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-70 min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
