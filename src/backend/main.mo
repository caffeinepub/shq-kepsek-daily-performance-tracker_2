import Text "mo:core/Text";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Order "mo:core/Order";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import BlobStorage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

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

  public type DailyReport = {
    date : Time.Time;
    attendanceScore : Nat; // 0-20
    classControlScore : Nat; // 0-20
    teacherControlScore : Nat; // 0-20
    waliSantriResponseScore : Nat; // 0-20
    programProblemSolvingScore : Nat; // 0-20
    totalScore : Nat; // 0-100
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

  let schools = Map.empty<Principal, School>();
  let dailyReports = Map.empty<Principal, Map.Map<Time.Time, DailyReport>>();

  public shared ({ caller }) func saveSchool(school : School) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can save schools");
    };
    schools.add(caller, school);
  };

  public query ({ caller }) func getSchool(principal : Principal) : async ?School {
    // Admin can view any school, Kepsek can only view their own
    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own school profile");
    };
    schools.get(principal);
  };

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

    let kepsekReports = switch (dailyReports.get(caller)) {
      case (null) { Map.empty<Time.Time, DailyReport>() };
      case (?reports) { reports };
    };

    kepsekReports.add(dailyReport.date, dailyReport);
    dailyReports.add(caller, kepsekReports);
  };

  public query ({ caller }) func getDailyReport(principal : Principal, date : Time.Time) : async ?DailyReport {
    // Admin can view any report, Kepsek can only view their own
    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own daily reports");
    };

    switch (dailyReports.get(principal)) {
      case (null) { null };
      case (?reports) { reports.get(date) };
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

  public query ({ caller }) func getTodayReports() : async [RankedDailyReport] {
    // Admin-only: monitoring dashboard
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view monitoring dashboard");
    };

    let today = Time.now();
    let ranked = List.empty<RankedDailyReport>();

    for ((principal, reports) in dailyReports.entries()) {
      switch (reports.get(today)) {
        case (null) { };
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
};
