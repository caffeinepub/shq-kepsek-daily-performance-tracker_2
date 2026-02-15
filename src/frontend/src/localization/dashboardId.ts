/**
 * Centralized Indonesian localization for Admin and Kepsek dashboards
 * All UI strings are defined here to avoid duplication and ensure consistency
 */

export const dashboardId = {
  // Common
  common: {
    loading: 'Memuat...',
    saving: 'Menyimpan...',
    save: 'Simpan',
    cancel: 'Batal',
    edit: 'Edit',
    retry: 'Coba Lagi',
    logout: 'Keluar',
    search: 'Cari',
    actions: 'Aksi',
    notProvided: 'Tidak tersedia',
    noPhoto: 'Tidak ada foto',
    required: 'Wajib diisi',
    optional: 'Opsional',
  },

  // Header
  header: {
    appName: 'SHQ Kepsek Tracker',
    tagline: 'Performa Harian',
  },

  // Footer
  footer: {
    builtWith: 'Dibuat dengan',
    love: 'cinta menggunakan',
    copyright: (year: number) => `© ${year} SHQ Kepsek Tracker`,
  },

  // Admin Dashboard
  admin: {
    title: 'Dashboard Direktur',
    subtitle: 'Monitoring performa harian kepala sekolah',
    manageKepsek: 'Kelola Kepsek',
    selectDate: 'Pilih tanggal',
    
    // Monitoring Table
    monitoring: {
      title: 'Monitoring Kepala Sekolah',
      description: 'Daftar kepala sekolah dan skor harian mereka (diurutkan berdasarkan skor tertinggi)',
      noSchools: 'Tidak ada sekolah aktif',
      rank: 'Peringkat',
      schoolName: 'Nama Sekolah',
      principalName: 'Nama Kepala Sekolah',
      status: 'Status',
      dailyProgress: 'Progress Harian',
      score: 'Skor',
      view: 'Lihat',
      notSubmitted: 'Belum Lapor',
      errorLoading: 'Gagal memuat data monitoring',
    },

    // Report Detail
    reportDetail: {
      title: 'Detail Laporan Harian',
      attendancePhoto: 'Foto Kehadiran:',
      noPhoto: 'Tidak ada foto',
      arrivalTime: 'Jam Datang',
      departureTime: 'Jam Pulang',
      scoreBreakdown: 'Rincian Skor:',
      categories: {
        attendance: 'Kehadiran + Foto',
        classControl: 'Kontrol Kelas',
        teacherControl: 'Kontrol Guru',
        parentResponse: 'Respon Wali Santri',
        programSolving: 'Program & Problem Solving',
      },
    },

    // Active Schools Section
    schools: {
      title: 'Sekolah Aktif',
      description: 'Daftar semua sekolah aktif dalam sistem',
      searchPlaceholder: 'Cari berdasarkan nama sekolah, wilayah, atau nama kepala sekolah...',
      showing: (filtered: number, total: number) => 
        `Menampilkan ${filtered} dari ${total} sekolah`,
      noResults: 'Tidak ada sekolah yang cocok dengan pencarian Anda.',
      noSchools: 'Belum ada sekolah aktif.',
      errorPermission: 'Anda tidak memiliki izin untuk melihat daftar sekolah.',
      errorGeneral: 'Gagal memuat daftar sekolah. Silakan coba lagi nanti.',
      region: 'Wilayah',
      principalId: 'ID Principal',
      editSchool: 'Edit sekolah',
    },

    // Edit School Dialog
    editDialog: {
      title: 'Edit Sekolah',
      description: 'Perbarui informasi sekolah. Perubahan akan langsung diterapkan.',
      schoolName: 'Nama Sekolah',
      region: 'Wilayah',
      principalName: 'Nama Kepala Sekolah',
      activeStatus: 'Status Aktif',
      principalIdLabel: 'ID Principal:',
      allFieldsRequired: 'Semua kolom wajib diisi',
      successUpdate: 'Sekolah berhasil diperbarui!',
      errorPermission: 'Anda tidak memiliki izin untuk memperbarui sekolah.',
      errorGeneral: 'Gagal memperbarui sekolah',
      saveChanges: 'Simpan Perubahan',
    },
  },

  // Kepsek Dashboard
  kepsek: {
    profileTitle: 'Profile Kepala Sekolah',
    profileSubtitle: 'Informasi sekolah dan kepala sekolah',
    schoolName: 'Nama Sekolah',
    region: 'Wilayah',
    principalName: 'Kepala Sekolah',

    // Error States
    error: {
      loadingProfile: 'Error Memuat Profil Sekolah',
      loadingDescription: 'Terjadi masalah saat memuat informasi sekolah Anda',
      retryLoading: 'Coba Muat Ulang',
      loadingReport: 'Error memuat laporan hari ini. Silakan coba lagi.',
    },

    // Missing School State
    missingSchool: {
      title: 'Profil Sekolah Belum Terdaftar',
      description: 'Profil sekolah Anda belum diatur',
      instruction: 'Untuk mengakses dashboard Kepsek, profil sekolah Anda harus didaftarkan oleh administrator. Silakan berikan ID Principal Anda kepada admin untuk menyelesaikan pendaftaran.',
      yourPrincipalId: 'ID Principal Anda',
      copyPrincipalId: 'Salin ID Principal',
      shareInstruction: 'Bagikan ID Principal ini kepada administrator Anda untuk mendaftarkan profil sekolah Anda',
      copiedToClipboard: 'ID Principal berhasil disalin!',
    },

    // Submission Status
    submission: {
      submitted: 'Anda sudah mengisi laporan hari ini. Terima kasih!',
      notSubmitted: 'Anda belum mengisi laporan hari ini. Silakan isi form di bawah.',
    },

    // Daily Report Form
    form: {
      currentScore: 'Skor Saat Ini',
      outOf: 'dari 100 poin',
      
      // Section 1: Attendance
      attendance: {
        title: '1. Kehadiran & Foto (20 poin)',
        description: 'Upload foto kehadiran dan catat jam datang & pulang',
        arrivalTime: 'Jam Datang',
        departureTime: 'Jam Pulang',
      },

      // Section 2: Class Control
      classControl: {
        title: '2. Kontrol Kelas (20 poin)',
        description: 'Apakah Anda melakukan kontrol kelas hari ini?',
        checkbox: 'Ya, saya sudah melakukan kontrol kelas',
        notes: 'Catatan (opsional)',
        placeholder: 'Tulis catatan tentang kontrol kelas...',
      },

      // Section 3: Teacher Control
      teacherControl: {
        title: '3. Kontrol Guru (20 poin)',
        description: 'Apakah Anda melakukan kontrol guru hari ini?',
        checkbox: 'Ya, saya sudah melakukan kontrol guru',
        notes: 'Catatan (opsional)',
        placeholder: 'Tulis catatan tentang kontrol guru...',
      },

      // Section 4: Parent Response
      parentResponse: {
        title: '4. Respon Wali Santri (20 poin)',
        description: 'Apakah Anda merespon wali santri hari ini?',
        checkbox: 'Ya, saya sudah merespon wali santri',
        notes: 'Catatan (opsional)',
        placeholder: 'Tulis catatan tentang respon wali santri...',
      },

      // Section 5: Program & Problem Solving
      programSolving: {
        title: '5. Program & Problem Solving (20 poin)',
        description: 'Apakah Anda melakukan program atau problem solving hari ini?',
        checkbox: 'Ya, saya sudah melakukan program atau problem solving',
        notes: 'Catatan (opsional)',
        placeholder: 'Tulis catatan tentang program atau problem solving...',
      },

      // Validation & Submit
      validation: {
        uploadPhoto: 'Silakan upload foto kehadiran',
        enterArrival: 'Silakan masukkan jam datang',
        enterDeparture: 'Silakan masukkan jam pulang',
      },
      submitNew: 'Simpan Laporan',
      submitUpdate: 'Update Laporan',
      successSave: 'Laporan harian berhasil disimpan!',
      errorSave: 'Gagal menyimpan laporan',
    },

    // Today's Submission Summary
    summary: {
      title: 'Laporan Hari Ini',
      description: 'Anda sudah mengisi laporan untuk hari ini',
      attendancePhoto: 'Foto Kehadiran:',
      scoreBreakdown: 'Rincian Skor:',
      editReport: 'Edit Laporan',
      categories: {
        attendance: 'Kehadiran',
        classControl: 'Kontrol Kelas',
        teacherControl: 'Kontrol Guru',
        parentResponse: 'Respon Wali Santri',
        programSolving: 'Program & Problem Solving',
      },
    },
  },
};
