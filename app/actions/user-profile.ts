'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateProfileSchema = z.object({
  first_name: z.string().max(50, 'First name must be less than 50 characters').optional(),
  last_name: z.string().max(50, 'Last name must be less than 50 characters').optional(),
  avatar_url: z.string()
    .refine(
      (val) => !val || val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
      'Avatar URL must be a relative path (starting with /) or a full URL'
    )
    .optional(),
}).refine(
  (data) => {
    const firstName = (data.first_name || '').trim();
    const lastName = (data.last_name || '').trim();
    return firstName.length > 0 || lastName.length > 0;
  },
  {
    message: 'At least one of first name or last name must be provided',
    path: ['first_name'], // This will show the error on the first_name field
  }
);

export async function updateUserProfile(data: {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Preprocess: trim strings, but keep empty strings to indicate field was cleared
  // Empty string = field was provided but cleared (should update to clear it)
  // Undefined = field wasn't provided (should keep existing value)
  const processedData = {
    first_name: data.first_name !== undefined ? (data.first_name.trim() || '') : undefined,
    last_name: data.last_name !== undefined ? (data.last_name.trim() || '') : undefined,
    avatar_url: data.avatar_url || undefined,
  };

  const validation = updateProfileSchema.safeParse(processedData);

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors)
      .map(([field, messages]) => `${field}: ${messages?.join(', ')}`)
      .join('; ');
    return { error: errorMessages || 'Invalid data', details: validation.error.flatten() };
  }

  // Get existing user metadata
  const existingMetadata = user.user_metadata || {};

  // Update user metadata with new values
  // If a field was provided (even if empty string), update it. Otherwise, keep existing value.
  const updatedMetadata: Record<string, any> = { ...existingMetadata };
  
  if (data.first_name !== undefined) {
    const trimmedFirstName = validation.data.first_name?.trim() || '';
    if (trimmedFirstName) {
      updatedMetadata.first_name = trimmedFirstName;
    } else {
      // Field was cleared, remove it from metadata
      delete updatedMetadata.first_name;
    }
  }
  
  if (data.last_name !== undefined) {
    const trimmedLastName = validation.data.last_name?.trim() || '';
    if (trimmedLastName) {
      updatedMetadata.last_name = trimmedLastName;
    } else {
      // Field was cleared, remove it from metadata
      delete updatedMetadata.last_name;
    }
  }
  
  if (data.avatar_url !== undefined) {
    if (validation.data.avatar_url) {
      updatedMetadata.avatar_url = validation.data.avatar_url;
    } else {
      // Avatar was cleared, remove it from metadata
      delete updatedMetadata.avatar_url;
    }
  }

  const { error } = await supabase.auth.updateUser({
    data: updatedMetadata,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
