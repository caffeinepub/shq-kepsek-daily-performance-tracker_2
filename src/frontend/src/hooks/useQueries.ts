import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { School, DailyReport, RankedDailyReport, UserRole, SchoolSummary } from '../backend';
import { Principal } from '@dfinity/principal';

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

// School/Profile queries
export function useGetCallerSchool() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<School | null>({
    queryKey: ['callerSchool'],
    queryFn: async () => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const principal = identity.getPrincipal();
      return actor.getSchool(principal);
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useSaveSchool() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (school: School) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveSchool(school);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerSchool'] });
      queryClient.invalidateQueries({ queryKey: ['activeSchoolsCount'] });
      queryClient.invalidateQueries({ queryKey: ['activeSchoolsList'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSchoolsList'] });
      queryClient.invalidateQueries({ queryKey: ['activeSchoolsCount'] });
    },
  });
}

// Daily Report queries
export function useGetTodayReport() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<DailyReport | null>({
    queryKey: ['todayReport'],
    queryFn: async () => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const principal = identity.getPrincipal();
      const today = BigInt(Date.now()) * BigInt(1_000_000); // Convert to nanoseconds
      return actor.getDailyReport(principal, today);
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetAllReportsForKepsek() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DailyReport[]>({
    queryKey: ['allKepsekReports'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllDailyReportsForKepsek();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSaveDailyReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: DailyReport) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveDailyReport(report);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayReport'] });
      queryClient.invalidateQueries({ queryKey: ['allKepsekReports'] });
      queryClient.invalidateQueries({ queryKey: ['todayReports'] });
      queryClient.invalidateQueries({ queryKey: ['activeSchoolsCount'] });
    },
  });
}

// Admin queries
export function useGetTodayReports() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<RankedDailyReport[]>({
    queryKey: ['todayReports'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTodayReports();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000, // Refresh every 30 seconds
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
      if (!actor) return [];
      return actor.getActiveSchoolsList();
    },
    enabled: !!actor && !actorFetching,
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
