import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface DailyMonitoringRow {
    report?: DailyReport;
    principal: Principal;
    school: School;
}
export interface School {
    region: string;
    active: boolean;
    name: string;
    principalName: string;
}
export interface RankedDailyReport {
    kepsek: Principal;
    dailyReport: DailyReport;
}
export interface SchoolSummary {
    principal: Principal;
    school: School;
}
export interface DailyReport {
    programProblemSolvingScore: bigint;
    waliSantriResponseScore: bigint;
    departureTime: Time;
    date: Time;
    totalScore: bigint;
    teacherControlScore: bigint;
    attendanceScore: bigint;
    classControlScore: bigint;
    attendancePhoto?: ExternalBlob;
}
export interface UserProfile {
    name: string;
    email: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getActiveSchoolsCount(): Promise<bigint>;
    getActiveSchoolsList(): Promise<Array<SchoolSummary>>;
    getAllDailyReportsForKepsek(): Promise<Array<DailyReport>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailyMonitoringRows(date: Time): Promise<Array<DailyMonitoringRow>>;
    getDailyReport(principal: Principal, date: Time): Promise<DailyReport | null>;
    getReportsForDate(date: Time): Promise<Array<RankedDailyReport>>;
    getSchool(principal: Principal): Promise<School | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveDailyReport(dailyReport: DailyReport): Promise<void>;
    saveSchool(school: School): Promise<void>;
    saveSchoolForPrincipal(principal: Principal, school: School): Promise<void>;
}
