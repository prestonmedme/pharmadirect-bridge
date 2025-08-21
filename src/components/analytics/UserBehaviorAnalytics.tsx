import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, UserCheck, UserX, ArrowRight } from 'lucide-react';
import { useUserBehaviorAnalytics } from '@/hooks/useAdvancedAnalytics';

interface UserBehaviorAnalyticsProps {
  dateRange: string;
}

export const UserBehaviorAnalytics: React.FC<UserBehaviorAnalyticsProps> = ({ dateRange }) => {
  const { data: behaviorData, isLoading, error } = useUserBehaviorAnalytics(dateRange);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Journey Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !behaviorData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            User Behavior Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No behavior data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* User Segments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            User Segments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Returning Users</p>
                  <p className="text-sm text-muted-foreground">
                    {behaviorData.returning_users} sessions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={(behaviorData.returning_users / behaviorData.total_sessions) * 100} 
                  className="w-24"
                />
                <Badge variant="secondary">
                  {((behaviorData.returning_users / behaviorData.total_sessions) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <UserX className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">New Users</p>
                  <p className="text-sm text-muted-foreground">
                    {behaviorData.new_users} sessions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={(behaviorData.new_users / behaviorData.total_sessions) * 100} 
                  className="w-24"
                />
                <Badge variant="secondary">
                  {((behaviorData.new_users / behaviorData.total_sessions) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 rounded-lg bg-primary/5">
                <p className="text-sm text-muted-foreground">Avg Session Duration</p>
                <p className="text-xl font-bold text-primary">
                  {Math.round(behaviorData.avg_session_duration || 0)}s
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground">Pages per Session</p>
                <p className="text-xl font-bold">
                  {(behaviorData.avg_pages_per_session || 0).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journey Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            User Journey Drop-offs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {behaviorData.drop_off_points?.map((dropOff, index) => (
              <div key={dropOff.step} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                    <span className="text-sm font-medium text-red-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{dropOff.step}</p>
                    <p className="text-sm text-muted-foreground">
                      {dropOff.users} users dropped off
                    </p>
                  </div>
                </div>
                <Badge variant="destructive" className="text-xs">
                  {dropOff.percentage.toFixed(1)}%
                </Badge>
              </div>
            )) || (
              <p className="text-muted-foreground">No drop-off data available</p>
            )}

            {behaviorData.common_paths && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Most Common User Paths</h4>
                <div className="space-y-2">
                  {behaviorData.common_paths.slice(0, 3).map((path, index) => (
                    <div key={index} className="text-sm p-2 rounded bg-muted/50">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs">{path.journey}</span>
                        <Badge variant="outline" className="text-xs">
                          {path.count} users
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};