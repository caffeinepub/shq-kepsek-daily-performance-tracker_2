import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { School, DailyReport, RankedDailyReport, UserRole, SchoolSummary } from '../backend';
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
      // Invalidate admin queries
      queryClient.invalidateQueries({ queryKey: ['activeSchoolsList'] });
      queryClient.invalidateQueries({ queryKey: ['activeSchoolsCount'] });
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
    },
  });
}

// Daily Report queries - PRINCIPAL-SCOPED
export function useGetTodayReport() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString();
  const todayKey = getTodayKey();

  return useQuery<DailyReport | null>({
    queryKey: ['todayReport', principalId, todayKey.toString()],
    queryFn: async () => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const principal = identity.getPrincipal();
      return actor.getDailyReport(principal, todayKey);
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
    queryKey: ['allKepsekReports', principalId],
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
    mutationFn: async (report: DailyReport) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveDailyReport(report);
      return report;
    },
    onSuccess: (savedReport) => {
      const principalId = identity?.getPrincipal().toString();
      const todayKey = getTodayKey();
      
      // Invalidate principal-scoped today report query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['todayReport', principalId, todayKey.toString()] });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['allKepsekReports', principalId] });
      queryClient.invalidateQueries({ queryKey: ['activeSchoolsCount'] });
      
      // Invalidate admin monitoring query so it shows the update immediately
      queryClient.invalidateQueries({ queryKey: ['reportsForDate'] });
    },
  });
}

// Admin queries - PRINCIPAL-SCOPED for cache invalidation on re-login
export function useGetReportsForDate(date: Date) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString();
  const dateKey = getStartOfDayNanoseconds(date);

  return useQuery<RankedDailyReport[]>({
    queryKey: ['reportsForDate', principalId, dateKey.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getReportsForDate(dateKey);
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useGetActiveSchoolsCount() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString();

  return useQuery<bigint>({
    queryKey: ['activeSchoolsCount', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getActiveSchoolsCount();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetActiveSchoolsList() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString();

  return useQuery<SchoolSummary[]>({
    queryKey: ['activeSchoolsList', principalId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveSchoolsList();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetDailyReportForPrincipal(principal: Principal | null, date: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DailyReport | null>({
    queryKey: ['dailyReport', principal?.toString(), date.toString()],
    queryFn: async () => {
      if (!actor || !principal) throw new Error('Actor or principal not available');
      return actor.getDailyReport(principal, date);
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}
