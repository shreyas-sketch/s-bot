import { supabase } from '@/integrations/supabase/client';
import { nanoid } from 'nanoid';

export const uploadImageToSupabase = async (file: File, sessionId: string): Promise<string> => {
  try {
    // Generate unique filename with sessionId prefix
    const fileExt = file.name.split('.').pop();
    const fileName = `${nanoid()}.${fileExt}`;
    const filePath = `temp-uploads/${sessionId}/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('chat-temp')
      .upload(filePath, file, {
        cacheControl: '600', // 10 minutes cache
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get signed URL valid for 10 minutes
    const { data: signedData, error: signError } = await supabase.storage
      .from('chat-temp')
      .createSignedUrl(filePath, 600); // 600 seconds = 10 minutes

    if (signError) {
      throw signError;
    }

    return signedData.signedUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

export const deleteImageFromSupabase = async (imageUrl: string): Promise<void> => {
  try {
    // Extract file path from signed URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/sign\/chat-temp\/(.+)\?/);
    
    if (!pathMatch) {
      console.warn('Could not extract file path from URL:', imageUrl);
      return;
    }

    const filePath = decodeURIComponent(pathMatch[1]);

    // Delete file from storage
    const { error } = await supabase.storage
      .from('chat-temp')
      .remove([filePath]);

    if (error) {
      console.warn('Error deleting image from storage:', error);
      // Don't throw - deletion failures should be silent
    }
  } catch (error) {
    console.warn('Error deleting image:', error);
    // Don't throw - deletion failures should be silent
  }
};