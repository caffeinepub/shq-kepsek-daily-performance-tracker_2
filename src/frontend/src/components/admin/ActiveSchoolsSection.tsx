import { useState, useMemo } from 'react';
import { useGetActiveSchoolsList } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, School, AlertCircle } from 'lucide-react';

export default function ActiveSchoolsSection() {
  const { data: schools = [], isLoading, error } = useGetActiveSchoolsList();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSchools = useMemo(() => {
    if (!searchQuery.trim()) return schools;

    const query = searchQuery.toLowerCase();
    return schools.filter((item) => {
      const schoolName = item.school.name.toLowerCase();
      const region = item.school.region.toLowerCase();
      const principalName = item.school.principalName.toLowerCase();
      
      return (
        schoolName.includes(query) ||
        region.includes(query) ||
        principalName.includes(query)
      );
    });
  }, [schools, searchQuery]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <School className="h-5 w-5 text-primary" />
          <CardTitle>Active Schools</CardTitle>
        </div>
        <CardDescription>
          List of all active schools in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search Input */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by school name, region, or principal name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Results Count */}
        <div className="mb-3 text-sm text-muted-foreground">
          {isLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <span>
              Showing {filteredSchools.length} of {schools.length} school{schools.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error && error.message.includes('Unauthorized')
                ? 'You do not have permission to view the schools list.'
                : 'Failed to load schools list. Please try again later.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredSchools.length === 0 && (
          <div className="text-center py-12">
            <School className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">
              {searchQuery.trim() ? 'No schools found matching your search.' : 'No active schools yet.'}
            </p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && filteredSchools.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School Name</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Principal Name</TableHead>
                  <TableHead>Principal ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.map((item) => (
                  <TableRow key={item.principal.toString()}>
                    <TableCell className="font-medium">{item.school.name}</TableCell>
                    <TableCell>{item.school.region}</TableCell>
                    <TableCell>{item.school.principalName}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.principal.toString().slice(0, 20)}...
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
