import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  
  // Get all cookies and delete them
  const allCookies = cookieStore.getAll();
  
  allCookies.forEach((cookie) => {
    cookieStore.delete(cookie.name);
  });

  return NextResponse.json({ 
    message: 'All cookies cleared',
    cleared: allCookies.map(c => c.name)
  });
}
