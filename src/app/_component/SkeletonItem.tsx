import React from 'react'
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

export default function SkeletonItem() {
    return (
        <Card className="animate-pulse">
            <CardHeader>
                <CardTitle className="bg-gray-700 h-4 w-3/4 mb-2 rounded"></CardTitle>
                <CardContent className="bg-gray-700 h-4 w-1/2 rounded"></CardContent>
            </CardHeader>
        </Card>
    )
}
