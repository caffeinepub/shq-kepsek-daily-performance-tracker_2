import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { School, DailyReport, RankedDailyReport, UserRole, SchoolSummary, DailyMonitoringRow } from '../backend';
import { Principal } from '@dfinity/principal';
import { getTodayKey, getStartOfDayNanoseconds } from '../utils/dayKey';

// Role queries
export function useGetCallerRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['callerRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    staleTime: Infinity,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    staleTime: Infinity,
  });
}

// Helper to refetch caller role (used by AccessDeniedPage retry)
export function useRefetchCallerRole() {
  const queryClient = useQueryClient();
  
  return async () => {
    await queryClient.invalidateQueries({ queryKey: ['callerRole'] });
    return queryClient.refetchQueries({ queryKey: ['callerRole'] });
  };
}

// School/Profile queries - PRINCIPAL-SCOPED
export function useGetCallerSchool() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString();

  return useQuery<School | null>({
    queryKey: ['callerSchool', principalId],
    queryFn: async () => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const principal = identity.getPrincipal();
      return actor.getSchool(principal);
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 2,
  });
}

export function useSaveSchool() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (school: School) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveSchool(school);
    },
    onSuccess: () => {
      const principalId = identity?.getPrincipal().toString();
      // Invalidate principal-scoped school query
      queryClient.invalidateQueries({ queryKey: ['callerSchool', principalId] });
      // Invalidate admin queries
      queryClient.invalidateQueries({ queryKey: ['activeSchoolsCount'] });
      queryClient.invalidateQueries({ queryKey: ['activeSchoolsList'] });
    },
  });
}

export function useSaveSchoolForPrincipal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ principal, school }: { principal: Principal; school: School }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveSchoolForPrincipal(principal, school);
    },
    onSuccess: (_, { principal }) => {
      // Invalidate the specific principal's school query
      queryClient.invalidateQueries({ queryKey: ['callerSchool', principal.toString()] });
      // Invalidate the role query for that principal (in case they're logged in)
      queryClient.invalidateQueries({ queryKey: ['callerRole'] });
      // Invalidate admin queries
      queryClient.invalidateQueries({ queryKey: ['activeSchoolsList'] });
      queryClient.invalidateQueries({ queryKey: ['activeSchoolsCount'] });
      // Invalidate monitoring queries
      queryClient.invalidateQueries({ queryKey: ['dailyMonitoringRows'] });
    },
  });
}

export function useUpdateSchoolForPrincipal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ principal, school }: { principal: Principal; school: School }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveSchoolForPrincipal(principal, school);
    },
    onSuccess: (_, { principal }) => {
      // Invalidate the specific principal's school query
      queryClient.invalidateQueries({ queryKey: ['callerSchool', principal.toString()] });
      // Invalidate admin queries
      queryClient.invalidateQueries({ queryKey: ['activeSchoolsList'] });
      queryClient.invalidateQueries({ queryKey: ['activeSchoolsCount'] });
      // Invalidate monitoring queries
      queryClient.invalidateQueries({ queryKey: ['dailyMonitoringRows'] });
    },
  });
}

// Daily Report queries - PRINCIPAL-SCOPED with DATE
export function useGetTodayReport() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString();
  const todayKey = getTodayKey();

  return useQuery<DailyReport | null>({
    queryKey: ['dailyReport', principalId, todayKey.toString()],
    queryFn: async () => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const principal = identity.getPrincipal();
      return actor.getDailyReport(principal, todayKey);
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 2,
  });
}

export function useGetReportForDate(date: Date) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString();
  const dateKey = getStartOfDayNanoseconds(date);

  return useQuery<DailyReport | null>({
    queryKey: ['dailyReport', principalId, dateKey.toString()],
    queryFn: async () => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const principal = identity.getPrincipal();
      return actor.getDailyReport(principal, dateKey);
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 2,
  });
}

export function useGetAllReportsForKepsek() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString();

  return useQuery<DailyReport[]>({
    queryKey: ['allReportsForKepsek', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllDailyReportsForKepsek();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useSaveDailyReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async ({ report, dateKey }: { report: DailyReport; dateKey: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveDailyReport(report);
      return dateKey; // Return dateKey for use in onSuccess
    },
    onSuccess: (dateKey) => {
      const principalId = identity?.getPrincipal().toString();
      
      // Invalidate the specific date's report query for this principal
      queryClient.invalidateQueries({ queryKey: ['dailyReport', principalId, dateKey.toString()] });
      
      // Invalidate all reports for this Kepsek
      queryClient.invalidateQueries({ queryKey: ['allReportsForKepsek', principalId] });
      
      // Invalidate admin queries for this specific date
      queryClient.invalidateQueries({ queryKey: ['reportsForDate', dateKey.toString()] });
      queryClient.invalidateQueries({ queryKey: ['dailyMonitoringRows', dateKey.toString()] });
      
      // Refetch the specific date's report immediately to get updated data
      queryClient.refetchQueries({ queryKey: ['dailyReport', principalId, dateKey.toString()] });
    },
  });
}

// Admin Dashboard queries with auto-refresh
export function useGetReportsForDate(date: Date) {
  const { actor, isFetching: actorFetching } = useActor();
  const dateKey = getStartOfDayNanoseconds(date);

  return useQuery<RankedDailyReport[]>({
    queryKey: ['reportsForDate', dateKey.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getReportsForDate(dateKey);
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true,
  });
}

export function useGetActiveSchoolsCount() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['activeSchoolsCount'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getActiveSchoolsCount();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetActiveSchoolsList() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SchoolSummary[]>({
    queryKey: ['activeSchoolsList'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getActiveSchoolsList();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetDailyMonitoringRows(date: Date) {
  const { actor, isFetching: actorFetching } = useActor();
  const dateKey = getStartOfDayNanoseconds(date);

  return useQuery<DailyMonitoringRow[]>({
    queryKey: ['dailyMonitoringRows', dateKey.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDailyMonitoringRows(dateKey);
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true,
  });
}

// User Profile queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  // Return custom state that properly reflects actor dependency
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: { name: string; email: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
