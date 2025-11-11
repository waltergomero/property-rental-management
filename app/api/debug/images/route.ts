import { NextRequest, NextResponse } from 'next/server';
import { fetchImagesByCategory } from '@/actions/gallery-actions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'Family';
    
    console.log('API: Fetching images for category:', category);
    const images = await fetchImagesByCategory(category);
    
    return NextResponse.json({
      category,
      imageCount: images?.length || 0,
      images: images,
      success: true
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, { status: 500 });
  }
}
