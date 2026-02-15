import Text "mo:core/Text";
import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import BlobStorage "blob-storage/Storage";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Upgrade persistent actor with embedded migration routine.

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type School = {
    name : Text;
    region : Text;
    principalName : Text;
    active : Bool;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
  };

  public type DailyReport = {
    date : Time.Time;
    attendanceScore : Nat;
    departureTime : Time.Time; // Separate field for departure time
    classControlScore : Nat;
    teacherControlScore : Nat;
    waliSantriResponseScore : Nat;
    programProblemSolvingScore : Nat;
    totalScore : Nat;
    attendancePhoto : ?BlobStorage.ExternalBlob;
  };

  public type RankedDailyReport = {
    kepsek : Principal;
    dailyReport : DailyReport;
  };

  module RankedDailyReport {
    public func compare(report1 : RankedDailyReport, report2 : RankedDailyReport) : Order.Order {
      Nat.compare(report2.dailyReport.totalScore, report1.dailyReport.totalScore);
    };
  };

  public type SchoolSummary = {
    principal : Principal;
    school : School;
  };

  // Persistent storage for schools, user profiles & daily reports!
  var schools = Map.empty<Principal, School>();
  var userProfiles = Map.empty<Principal, UserProfile>();
  var dailyReports = Map.empty<Principal, Map.Map<Time.Time, DailyReport>>();

  // User Profile Management Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // School Management Functions
  public shared ({ caller }) func saveSchool(school : School) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller) and not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only Kepsek or Admin can save a school");
    };
    schools.add(caller, school);
  };

  public shared ({ caller }) func saveSchoolForPrincipal(principal : Principal, school : School) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update schools");
    };
    schools.add(principal, school);
  };

  public query ({ caller }) func getSchool(principal : Principal) : async ?School {
    // Admin can view any school, Kepsek can only view their own
    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own school profile");
    };
    schools.get(principal);
  };

  // Daily Report Functions
  public shared ({ caller }) func saveDailyReport(dailyReport : DailyReport) : async () {
    // Only users (Kepsek) can submit daily reports
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only Kepsek can submit daily reports");
    };

    // Verify that the Kepsek has a registered school
    switch (schools.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: No school registered for this Kepsek");
      };
      case (?school) {
        if (not school.active) {
          Runtime.trap("Unauthorized: School is not active");
        };
      };
    };

    let reportDayKey = normalizeToDay(dailyReport.date);

    let kepsekReports = switch (dailyReports.get(caller)) {
      case (null) { Map.empty<Time.Time, DailyReport>() };
      case (?reports) { reports };
    };
    kepsekReports.add(reportDayKey, dailyReport);
    dailyReports.add(caller, kepsekReports);
  };

  public query ({ caller }) func getDailyReport(principal : Principal, date : Time.Time) : async ?DailyReport {
    // Admin can view any report, Kepsek can only view their own
    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own daily reports");
    };

    let reportDayKey = normalizeToDay(date);

    switch (dailyReports.get(principal)) {
      case (null) { null };
      case (?reports) { reports.get(reportDayKey) };
    };
  };

  public query ({ caller }) func getAllDailyReportsForKepsek() : async [DailyReport] {
    // Only users (Kepsek) can view their own reports
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only Kepsek can view their reports");
    };

    switch (dailyReports.get(caller)) {
      case (null) { [] };
      case (?reports) {
        reports.values().toArray();
      };
    };
  };

  // Admin Dashboard Functions
  public query ({ caller }) func getReportsForDate(date : Time.Time) : async [RankedDailyReport] {
    // Admin-only: monitoring dashboard
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view monitoring dashboard");
    };

    let dateKey = normalizeToDay(date);

    let ranked = List.empty<RankedDailyReport>();

    for ((principal, reports) in dailyReports.entries()) {
      switch (reports.get(dateKey)) {
        case (null) {};
        case (?dailyReport) {
          ranked.add({
            kepsek = principal;
            dailyReport;
          });
        };
      };
    };

    ranked.toArray().sort();
  };

  public query ({ caller }) func getActiveSchoolsCount() : async Nat {
    // Admin-only: dashboard statistics
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view statistics");
    };

    var count = 0;
    for (school in schools.values()) {
      if (school.active) {
        count += 1;
      };
    };
    count;
  };

  public query ({ caller }) func getActiveSchoolsList() : async [SchoolSummary] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view schools list");
    };

    schools.toArray().filter(
      func((_, school)) {
        school.active;
      }
    ).map(
      func((principal, school)) {
        {
          principal;
          school;
        };
      }
    );
  };

  // Helper Functions
  func normalizeToDay(timestamp : Time.Time) : Time.Time {
    // Convert nanoseconds to days, then back to nanoseconds at midnight
    let days = timestamp / 86400000000000;
    days * 86400000000000;
  };
};
