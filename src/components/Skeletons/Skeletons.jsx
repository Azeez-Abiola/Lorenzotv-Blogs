import React from 'react';

// Skeleton for blog post cards
export const PostCardSkeleton = () => (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
        <div className="aspect-[16/10] bg-gray-200"></div>
        <div className="p-6 space-y-4">
            <div className="h-3 w-20 bg-gray-200 rounded"></div>
            <div className="h-5 w-full bg-gray-200 rounded"></div>
            <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
            <div className="flex items-center gap-4 pt-2">
                <div className="h-3 w-12 bg-gray-200 rounded"></div>
                <div className="h-3 w-12 bg-gray-200 rounded"></div>
            </div>
        </div>
    </div>
);

// Skeleton for the main blog post
export const BlogPostSkeleton = () => (
    <div className="animate-pulse">
        {/* Header */}
        <div className="max-w-4xl mx-auto pt-40 px-6">
            <div className="flex items-center space-x-3 mb-6">
                <div className="h-6 w-24 bg-gray-200 rounded-lg"></div>
                <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
            <div className="h-12 w-full bg-gray-200 rounded-xl mb-4"></div>
            <div className="h-12 w-3/4 bg-gray-200 rounded-xl mb-8"></div>

            <div className="flex items-center justify-between pb-8 border-b border-gray-100 mb-12">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
                    <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Image */}
        <div className="max-w-6xl mx-auto px-6 mb-16">
            <div className="w-full h-[60vh] bg-gray-200 rounded-[3rem]"></div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-6 space-y-6">
            <div className="h-5 w-full bg-gray-200 rounded"></div>
            <div className="h-5 w-full bg-gray-200 rounded"></div>
            <div className="h-5 w-5/6 bg-gray-200 rounded"></div>
            <div className="h-5 w-full bg-gray-200 rounded"></div>
            <div className="h-5 w-4/5 bg-gray-200 rounded"></div>
            <div className="h-5 w-full bg-gray-200 rounded"></div>
            <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
        </div>
    </div>
);

// Skeleton for founder's series item
export const FounderSeriesSkeleton = () => (
    <div className="flex flex-col md:flex-row items-center gap-16 animate-pulse">
        <div className="flex-1 w-full">
            <div className="aspect-[16/9] bg-gray-200 rounded-[3rem]"></div>
        </div>
        <div className="flex-1 space-y-6">
            <div className="flex items-center space-x-4">
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
                <div className="h-3 w-3 bg-gray-200 rounded-full"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="h-10 w-full bg-gray-200 rounded-xl"></div>
            <div className="h-10 w-3/4 bg-gray-200 rounded-xl"></div>
            <div className="space-y-3">
                <div className="h-5 w-full bg-gray-200 rounded"></div>
                <div className="h-5 w-full bg-gray-200 rounded"></div>
                <div className="h-5 w-4/5 bg-gray-200 rounded"></div>
            </div>
            <div className="h-12 w-48 bg-gray-200 rounded-2xl"></div>
        </div>
    </div>
);

export default { PostCardSkeleton, BlogPostSkeleton, FounderSeriesSkeleton };
