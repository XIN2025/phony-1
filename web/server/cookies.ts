'use server';

import { cookies } from 'next/headers';

export const setIsNewUserCookie = async (isNewUser: boolean) => {
  const cookieStore = await cookies();
  cookieStore.set('is_new', isNewUser.toString(), {
    path: '/',
  });
};
