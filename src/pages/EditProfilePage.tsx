import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@animaapp/playground-react-sdk';
import { useMockQuery } from '@/hooks/useMockQuery';
import { useMockMutation } from '@/hooks/useMockMutation';
import { isMockMode } from '@/utils/mockMode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { handleAvatarError } from '@/lib/utils';
import { Camera, Loader2 } from 'lucide-react';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Auth
  const { user } = useAuth();

  // Data Source: UserProfile Entity
  // We use a separate entity because the default User object is often immutable or limited
  const realQuery = isMockMode() ? null : useQuery('UserProfile', { where: { userId: user?.id || '' } });
  const mockQuery = isMockMode() ? useMockQuery('UserProfile', { userId: user?.id }) : null;
  const { data: userProfiles, isPending: isLoadingProfile } = (isMockMode() ? mockQuery : realQuery)!;
  
  const userProfile = userProfiles && userProfiles.length > 0 ? userProfiles[0] : null;

  const realMutation = isMockMode() ? null : useMutation('UserProfile');
  const mockMutation = isMockMode() ? useMockMutation('UserProfile') : null;
  const { create, update } = (isMockMode() ? mockMutation : realMutation)!;

  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    website: '',
    email: '',
  });

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Initialize form data
  useEffect(() => {
    if (user) {
      console.log('[EditProfile] Initializing form with user data:', user);
      console.log('[EditProfile] Fetched UserProfile entity:', userProfile);

      setFormData({
        name: user.name || '',
        email: user.email || '',
        // Prefer UserProfile data, fallback to User data or defaults
        username: userProfile?.username || (user as any).username || user.email?.split('@')[0] || '',
        bio: userProfile?.bio || (user as any).bio || '',
        website: userProfile?.website || (user as any).website || '',
      });
    }
  }, [user, userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    console.group('📝 [EditProfile] Saving Profile');
    console.log('Target Data Source: UserProfile Entity');
    console.log('User ID:', user.id);
    console.log('Payload:', {
      username: formData.username,
      bio: formData.bio,
      website: formData.website,
    });

    try {
      let profilePictureUrl = userProfile?.profilePictureUrl;

      // If a new image was selected, "upload" it (convert to Base64 for persistence)
      if (selectedFile) {
        profilePictureUrl = await convertToBase64(selectedFile);
      }

      // 1. Update UserProfile Entity (for bio, website, username, profilePictureUrl)
      if (userProfile) {
        console.log('Action: UPDATE existing UserProfile', userProfile.id);
        await update(userProfile.id, {
          username: formData.username,
          bio: formData.bio,
          website: formData.website,
          profilePictureUrl,
        });
      } else {
        console.log('Action: CREATE new UserProfile');
        await create({
          userId: user.id,
          username: formData.username,
          bio: formData.bio,
          website: formData.website,
          profilePictureUrl,
        });
      }

      console.log('✅ Save Successful');
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      if (user) {
        navigate(`/profile/${user.id}`);
      } else {
        navigate('/ladder');
      }
    } catch (error) {
      console.error('❌ Save Failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      console.groupEnd();
      setIsSaving(false);
    }
  };

  return (
    <InstagramLayout>
      <div className="w-full max-w-2xl mx-auto py-4 px-4 sm:py-6 lg:py-8">
        <h1 className="text-h1 font-bold text-foreground mb-8">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo */}
          <div className="flex items-center gap-6 p-6 bg-background border border-border rounded-lg">
            <div className="relative">
              <div className="w-20 h-20 aspect-square rounded-full overflow-hidden bg-tertiary border border-border">
                <img
                  src={previewImage || (user as any)?.profilePictureUrl || "https://c.animaapp.com/mlkxz4s0AuRnuX/img/ai_5.png"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={handleAvatarError}
                />
              </div>
              <label
                htmlFor="profile-photo-upload"
                className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-primary text-primary-foreground rounded-full flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
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
                      setPreviewImage(objectUrl);
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
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-background border border-border rounded-lg p-6 space-y-4">
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

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 h-12 bg-gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-70"
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
            <Button
              type="button"
              variant="outline"
              onClick={() => user ? navigate(`/profile/${user.id}`) : navigate('/ladder')}
              disabled={isSaving}
              className="h-12 px-8 border-border hover:bg-tertiary"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </InstagramLayout>
  );
}
