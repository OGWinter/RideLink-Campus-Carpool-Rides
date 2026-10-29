/**
 * RideLink — Campus Carpool Connect (Bhopal Edition)
 * Production-ready vanilla JavaScript application with rich state management,
 * business logic validation, localStorage persistence, GSAP animations,
 * and complete localization for Bhopal, Madhya Pradesh (India).
 */

(function () {
  'use strict';

  // --- Constants & Storage Keys ---
  const STORAGE_KEY = 'ridelink_bhopal_v3';

  // --- Date & Time in Asia/Kolkata (IST) ---
  function getTodayIST() {
    const now = new Date();
    const dtf = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return dtf.format(now); // 'YYYY-MM-DD'
  }

  function formatDateOffset(daysAhead) {
    const todayStr = getTodayIST();
    const [y, m, d] = todayStr.split('-').map(Number);
    const target = new Date(y, m - 1, d + daysAhead);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Currency Formatter in Indian Rupees (₹)
  const inrFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  function formatCurrencyINR(amount) {
    return inrFormatter.format(Math.round(amount || 0));
  }

  // --- Initial Seed Data (Bhopal Student Commuters) ---
  const SEED_USERS = [
    {
      id: 'user-aarav',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@manit.ac.in',
      role: 'driver',
      major: 'Senior • B.Tech CompSci, MANIT Bhopal',
      phone: '+91 98260 12345',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewCount: 24,
      car: {
        model: 'Hyundai i20',
        color: 'Silver',
        plate: 'MP-04-AB-4821'
      },
      womenOnlyPref: false,
      co2SavedKg: 28.5,
      moneySaved: 2450,
      bio: 'Daily commuter from MANIT Gate 1 to MP Nagar & Rani Kamlapati Station. Safe driver, love acoustic Hindi & indie music.'
    },
    {
      id: 'user-priya',
      name: 'Priya Patel',
      email: 'priya.patel@bubhopal.ac.in',
      role: 'passenger',
      major: 'Junior • M.Sc Biotechnology, Barkatullah University',
      phone: '+91 94250 67890',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviewCount: 16,
      car: null,
      womenOnlyPref: true,
      co2SavedKg: 19.2,
      moneySaved: 1820,
      bio: 'BU campus student commuting between Arera Colony 10 No. Market and Hoshangabad Road campus labs. Punctual & friendly.'
    },
    {
      id: 'user-rohan',
      name: 'Rohan Verma',
      email: 'rohan.verma@rgpv.ac.in',
      role: 'hybrid',
      major: 'Graduate • M.Tech Energy, RGPV Bhopal',
      phone: '+91 97550 54321',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      rating: 4.85,
      reviewCount: 21,
      car: {
        model: 'Maruti Baleno',
        color: 'Arctic White',
        plate: 'MP-04-CE-7290'
      },
      womenOnlyPref: false,
      co2SavedKg: 35.8,
      moneySaved: 3200,
      bio: 'RGPV Airport Road to DB City Mall & Bittan Market 3 days a week. Committed to green shared mobility in MP.'
    }
  ];

  const SEED_RIDES = [
    {
      id: 'ride-101',
      driverId: 'user-aarav',
      origin: 'MANIT Bhopal (Main Gate)',
      destination: 'Rani Kamlapati Railway Station (RKMP)',
      intermediateStops: ['Bittan Market Haat Ground', 'Arera Colony (10 No. Market)'],
      departureDate: formatDateOffset(0),
      departureTime: '17:30',
      totalSeats: 3,
      availableSeats: 3, // All 3 available; pending request from Priya awaiting Aarav's approval
      totalFuelCost: 120,
      womenOnly: false,
      notes: 'Leaving right from MANIT Gate 1 flagpole at 5:30 PM sharp. Room for backpacks in boot space.',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'ride-102',
      driverId: 'user-rohan',
      origin: 'RGPV Campus (Airport Road Gate)',
      destination: 'MP Nagar Zone-1 (DB Mall Circle)',
      intermediateStops: ['Lalghati Square', 'Bhopal Junction (Platform 6)'],
      departureDate: formatDateOffset(1),
      departureTime: '08:30',
      totalSeats: 4,
      availableSeats: 4, // 4 seats total; pending request from Priya
      totalFuelCost: 180,
      womenOnly: false,
      notes: 'Morning trip towards MP Nagar tech park. Smooth route via VIP Road and Chetak Bridge.',
      createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
    },
    {
      id: 'ride-103',
      driverId: 'user-aarav',
      origin: 'MANIT Bhopal (Main Gate)',
      destination: 'BHEL Township (Piplani)',
      intermediateStops: ['MP Nagar Zone-1 (DB Mall Circle)', 'ISBT Bhopal'],
      departureDate: formatDateOffset(2),
      departureTime: '09:15',
      totalSeats: 3,
      availableSeats: 3, // 3 available; pending request from Rohan
      totalFuelCost: 160,
      womenOnly: false,
      notes: 'Commute for engineering internship in Govindpura/BHEL industrial area. AC carpool.',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
    },
    {
      id: 'ride-104',
      driverId: 'user-rohan',
      origin: 'Barkatullah University (Hoshangabad Rd Gate)',
      destination: 'Kolar Road (Sarvadharma)',
      intermediateStops: ['Shahpura Lake Circle', 'Bittan Market Haat Ground'],
      departureDate: formatDateOffset(0),
      departureTime: '18:45',
      totalSeats: 3,
      availableSeats: 2, // 1 seat booked by Priya (approved)
      totalFuelCost: 100,
      womenOnly: false,
      notes: 'Evening ride after university research labs towards Kolar Road. Punctual departure.',
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
      id: 'ride-105',
      driverId: 'user-aarav',
      origin: 'MANIT Bhopal (Main Gate)',
      destination: 'New Market (Topkhana / TT Nagar)',
      intermediateStops: ['Mata Mandir Circle'],
      departureDate: formatDateOffset(3),
      departureTime: '16:30',
      totalSeats: 2,
      availableSeats: 2,
      totalFuelCost: 80,
      womenOnly: false,
      notes: 'Quick trip for project stationery and books at New Market Topkhana.',
      createdAt: new Date(Date.now() - 3600000 * 22).toISOString()
    },
    {
      id: 'ride-106',
      driverId: 'user-rohan',
      origin: 'Arera Colony (10 No. Market)',
      destination: 'RGPV Campus (Airport Road Gate)',
      intermediateStops: ['MP Nagar Zone-1 (DB Mall Circle)', 'Lalghati Square'],
      departureDate: formatDateOffset(1),
      departureTime: '09:00',
      totalSeats: 3,
      availableSeats: 3,
      totalFuelCost: 220,
      womenOnly: true,
      notes: 'Women-only carpool for state inter-college seminar. Safe & verified college peers only.',
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
    }
  ];

  const SEED_REQUESTS = [
    {
      id: 'req-201',
      rideId: 'ride-101',
      passengerId: 'user-priya',
      pickupStop: 'MANIT Bhopal (Main Gate)',
      dropoffStop: 'Rani Kamlapati Railway Station (RKMP)',
      status: 'PENDING', // PENDING for Aarav Sharma to approve
      note: 'Catching the Vande Bharat Express at RKMP Station! Need a seat please.',
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
    },
    {
      id: 'req-202',
      rideId: 'ride-103',
      passengerId: 'user-rohan',
      pickupStop: 'MANIT Bhopal (Main Gate)',
      dropoffStop: 'ISBT Bhopal',
      status: 'PENDING', // PENDING for Aarav Sharma to approve
      note: 'Need to pick up engineering parts near ISBT Bhopal. Happy to split fuel!',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'req-203',
      rideId: 'ride-102',
      passengerId: 'user-priya',
      pickupStop: 'Lalghati Square',
      dropoffStop: 'MP Nagar Zone-1 (DB Mall Circle)',
      status: 'PENDING', // PENDING for Rohan Verma to approve
      note: 'Need drop-off near DB City Mall entrance for classes.',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 'req-204',
      rideId: 'ride-104',
      passengerId: 'user-priya',
      pickupStop: 'Barkatullah University (Hoshangabad Rd Gate)',
      dropoffStop: 'Kolar Road (Sarvadharma)',
      status: 'APPROVED', // Confirmed booking demonstration
      note: 'Carrying a small laptop bag, thanks Rohan!',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    }
  ];

  const SEED_NOTIFICATIONS = [
    {
      id: 'notif-1',
      userId: 'user-aarav',
      type: 'new_request',
      title: 'New Seat Request from Priya Patel',
      message: 'Priya requested 1 seat on your Bhopal carpool to Rani Kamlapati Station (RKMP). Click Driver Requests to approve.',
      read: false,
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString()
    },
    {
      id: 'notif-2',
      userId: 'user-aarav',
      type: 'new_request',
      title: 'New Seat Request from Rohan Verma',
      message: 'Rohan requested 1 seat on your Bhopal carpool to BHEL Township (ISBT drop-off). Click Driver Requests to approve.',
      read: false,
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'notif-3',
      userId: 'user-priya',
      type: 'approved',
      title: 'Booking Confirmed!',
      message: 'Rohan approved your seat request for Kolar Road (Sarvadharma).',
      read: false,
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
    }
  ];

  // --- App State ---
  let state = {
    currentUserId: 'user-aarav', // Default demo persona
    users: [],
    rides: [],
    requests: [],
    notifications: [],
    currentView: 'dashboard',
    activeModal: null,
    pendingCancelRequestId: null,
    searchFilters: {
      origin: '',
      destination: '',
      date: '',
      seats: 'any',
      maxPrice: 200,
      womenOnly: false,
      hideFull: true,
      sortBy: 'earliest'
    }
  };

  // --- Motion & Animation Helpers ---
  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function runGSAPEntrance() {
    if (!window.gsap || prefersReducedMotion()) return;

    try {
      gsap.from('#dashboard-hero-card', {
        opacity: 0,
        y: 12,
        duration: 0.45,
        ease: 'power2.out'
      });

      gsap.from('#dashboard-stats-grid .stat-card', {
        opacity: 0,
        y: 12,
        stagger: 0.06,
        duration: 0.4,
        ease: 'power2.out',
        delay: 0.1
      });

      gsap.from('#dashboard-search-card', {
        opacity: 0,
        y: 10,
        duration: 0.4,
        ease: 'power2.out',
        delay: 0.2
      });
    } catch (e) {
      console.warn('GSAP animation skipped', e);
    }
  }

  function runGSAPViewTransition(viewElem) {
    if (!window.gsap || prefersReducedMotion() || !viewElem) return;
    try {
      gsap.fromTo(viewElem, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.22, ease: 'power1.out' });
    } catch (e) {
      // Fallback to normal CSS visibility
    }
  }

  function runGSAPModalEntrance(dialogElem) {
    if (!window.gsap || prefersReducedMotion() || !dialogElem) return;
    try {
      gsap.fromTo(dialogElem, { opacity: 0, scale: 0.95, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.22, ease: 'back.out(1.2)' });
    } catch (e) {
      // Fallback
    }
  }

  // --- Utility Functions ---

  /**
   * Escape HTML to prevent XSS injection from user input
   */
  function escapeHTML(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Calculate per-passenger fair share fuel cost in INR
   * Formula: Total Fuel / (Offered Passenger Seats + 1 Driver)
   * The driver and each passenger share the total estimated fuel expense equally.
   */
  function calculatePerPassengerCost(totalFuel, totalSeats) {
    const cost = Number(totalFuel) || 0;
    const seats = Math.max(1, Number(totalSeats) || 1);
    const totalTravelers = seats + 1; // Passenger seats + 1 driver
    const perPerson = cost / totalTravelers;
    return Math.max(10, Math.round(perPerson));
  }

  /**
   * Format Indian date without UTC-offset shifts
   */
  function formatHumanDate(dateStr) {
    if (!dateStr) return '';
    const todayIST = getTodayIST();
    if (dateStr === todayIST) return 'Today';

    const [y1, m1, d1] = todayIST.split('-').map(Number);
    const [y2, m2, d2] = dateStr.split('-').map(Number);
    const t1 = new Date(y1, m1 - 1, d1).getTime();
    const t2 = new Date(y2, m2 - 1, d2).getTime();
    const diffDays = Math.round((t2 - t1) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';

    const dateObj = new Date(y2, m2 - 1, d2);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).format(dateObj);
  }

  /**
   * Format 24h time string to Indian 12h format
   */
  function formatHumanTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${suffix}`;
  }

  /**
   * Format relative time for notifications
   */
  function formatTimeAgo(isoString) {
    if (!isoString) return 'Recently';
    const dateMs = new Date(isoString).getTime();
    if (isNaN(dateMs)) return 'Recently';
    const diffMs = Date.now() - dateMs;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  /**
   * Safely re-render Lucide icons
   */
  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // --- Local Storage Management ---

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.users && parsed.rides && parsed.requests) {
          state.users = parsed.users;
          state.rides = parsed.rides;
          state.requests = parsed.requests;
          state.notifications = parsed.notifications || [];
          state.currentUserId = parsed.currentUserId || 'user-aarav';
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse localStorage, resetting to Bhopal seed data', e);
    }
    // Default fallback to seed data
    resetToSeedData(false);
  }

  function saveState() {
    try {
      const dataToSave = {
        users: state.users,
        rides: state.rides,
        requests: state.requests,
        notifications: state.notifications,
        currentUserId: state.currentUserId
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Error saving state to localStorage', e);
    }
  }

  function resetToSeedData(showNotification = true) {
    state.users = JSON.parse(JSON.stringify(SEED_USERS));
    state.rides = JSON.parse(JSON.stringify(SEED_RIDES));
    state.requests = JSON.parse(JSON.stringify(SEED_REQUESTS));
    state.notifications = JSON.parse(JSON.stringify(SEED_NOTIFICATIONS));
    state.currentUserId = 'user-aarav';
    saveState();
    if (showNotification) {
      showToast('Bhopal Demo Data Restored!', 'Fresh campus carpools and test bookings are ready.', 'success');
      renderApp();
    }
  }

  // --- Toast Notifications ---

  function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');

    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'warning') iconName = 'alert-triangle';
    if (type === 'danger') iconName = 'x-circle';

    toast.innerHTML = `
      <div class="toast-icon">
        <i data-lucide="${iconName}"></i>
      </div>
      <div class="toast-body">
        <div class="toast-title">${escapeHTML(title)}</div>
        <div class="toast-msg">${escapeHTML(message)}</div>
      </div>
      <button class="toast-close" aria-label="Dismiss toast">
        <i data-lucide="x"></i>
      </button>
    `;

    container.appendChild(toast);
    refreshIcons();

    // GSAP Toast entrance
    if (window.gsap && !prefersReducedMotion()) {
      try {
        gsap.fromTo(toast, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' });
      } catch (e) {
        // Fallback
      }
    }

    const dismissTimer = setTimeout(() => {
      dismissToast(toast);
    }, 4500);

    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        clearTimeout(dismissTimer);
        dismissToast(toast);
      });
    }
  }

  function dismissToast(toast) {
    if (window.gsap && !prefersReducedMotion()) {
      try {
        gsap.to(toast, {
          opacity: 0,
          x: 40,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
          }
        });
        return;
      } catch (e) {
        // Fallback
      }
    }
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 220);
  }

  // --- Notification Center ---

  function addNotification(userId, title, message, type = 'info') {
    const newNotif = {
      id: 'notif-' + Date.now(),
      userId,
      title,
      message,
      type,
      read: false,
      timestamp: new Date().toISOString()
    };
    state.notifications.unshift(newNotif);
    saveState();
    updateNotificationBadges();
  }

  function markAllNotificationsRead() {
    state.notifications.forEach(n => {
      if (n.userId === state.currentUserId) {
        n.read = true;
      }
    });
    saveState();
    updateNotificationBadges();
    renderNotificationList();
    showToast('Notifications marked as read', '', 'info');
  }

  function updateNotificationBadges() {
    const unread = state.notifications.filter(n => n.userId === state.currentUserId && !n.read);
    const badge = document.getElementById('notif-badge');
    const countText = document.getElementById('notif-count-text');

    if (badge) {
      badge.style.display = unread.length > 0 ? 'block' : 'none';
    }
    if (countText) {
      countText.textContent = `${unread.length} unread notification${unread.length === 1 ? '' : 's'}`;
    }
  }

  function renderNotificationList() {
    const container = document.getElementById('notif-list-container');
    if (!container) return;

    const userNotifs = state.notifications.filter(n => n.userId === state.currentUserId);
    if (userNotifs.length === 0) {
      container.innerHTML = `
        <div class="notif-empty">
          <p>No notifications yet for this Bhopal account.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = userNotifs.map(n => {
      let iconColorClass = 'icon-blue';
      let iconName = 'bell';
      if (n.type === 'approved') {
        iconColorClass = 'icon-emerald';
        iconName = 'check-circle';
      } else if (n.type === 'rejected') {
        iconColorClass = 'icon-amber';
        iconName = 'x-circle';
      } else if (n.type === 'new_request') {
        iconColorClass = 'icon-green';
        iconName = 'user-plus';
      }

      return `
        <div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
          <div class="notif-icon-circle ${iconColorClass}">
            <i data-lucide="${iconName}"></i>
          </div>
          <div class="notif-item-body">
            <div class="notif-text"><strong>${escapeHTML(n.title)}:</strong> ${escapeHTML(n.message)}</div>
            <span class="notif-time">${formatTimeAgo(n.timestamp)}</span>
          </div>
        </div>
      `;
    }).join('');

    refreshIcons();
  }

  // --- User Helpers ---

  function getCurrentUser() {
    return state.users.find(u => u.id === state.currentUserId) || state.users[0];
  }

  function getUserById(id) {
    return state.users.find(u => u.id === id);
  }

  function getRideById(id) {
    return state.rides.find(r => r.id === id);
  }

  // --- Navigation & View Management ---

  function switchView(viewName) {
    const previousView = state.currentView;
    state.currentView = viewName;

    // Update Section Visibility
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });
    const targetSection = document.getElementById(`${viewName}-view`);
    if (targetSection) {
      targetSection.classList.add('active');
      if (previousView !== viewName) {
        runGSAPViewTransition(targetSection);
      }
    }

    // Update Desktop Nav Links
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
      if (link.getAttribute('data-view') === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update Mobile Nav Links
    document.querySelectorAll('.mobile-nav-bar .mobile-nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Close Mobile Drawer if open
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');

    // Update Topbar Title
    const titles = {
      'dashboard': 'Campus Dashboard',
      'find-rides': 'Find Bhopal Campus Rides',
      'offer-ride': 'Offer a Bhopal Campus Ride',
      'my-bookings': 'My Ride Bookings',
      'driver-requests': 'Driver Inquiries & Approvals',
      'history': 'Ride History & Carbon Receipts',
      'campus-hubs': 'Bhopal Campus Carpool Hubs',
      'profile': 'Student Commuter Profile'
    };
    const titleElem = document.getElementById('page-title');
    if (titleElem) {
      titleElem.textContent = titles[viewName] || 'RideLink';
    }

    // Specific View Renderers
    if (viewName === 'dashboard') renderDashboard();
    if (viewName === 'find-rides') renderFindRides();
    if (viewName === 'offer-ride') syncOfferRideDefaults();
    if (viewName === 'my-bookings') renderMyBookings();
    if (viewName === 'driver-requests') renderDriverRequests();
    if (viewName === 'history') renderHistory();
    if (viewName === 'profile') renderProfileForm();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    refreshIcons();
  }

  // --- Modal Helpers ---

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      state.activeModal = modalId;
      document.body.style.overflow = 'hidden';

      const dialog = modal.querySelector('.modal-dialog');
      runGSAPModalEntrance(dialog);

      refreshIcons();

      const firstInput = modal.querySelector('input, select, textarea, button:not(.btn-close-modal)');
      if (firstInput) firstInput.focus();
    }
  }

  function closeModal(modalId) {
    const idToClose = modalId || state.activeModal;
    if (idToClose) {
      const modal = document.getElementById(idToClose);
      if (modal) {
        modal.style.display = 'none';
      }
      state.activeModal = null;
      document.body.style.overflow = '';
    }
  }

  // --- PERSONA SWITCHER LOGIC (Bhopal Students) ---

  function switchDemoUser(userId) {
    state.currentUserId = userId;
    saveState();
    closeModal('persona-switch-modal');

    const user = getCurrentUser();
    showToast(`Persona Switched`, `Testing as ${user.name} (${user.role.toUpperCase()} • ${user.major.split('•')[0].trim()})`, 'info');

    renderApp();
  }

  function renderPersonaModal() {
    const list = document.getElementById('persona-list-container');
    if (!list) return;

    list.innerHTML = state.users.map(u => {
      const isSelected = u.id === state.currentUserId;
      const roleLabel = u.role === 'driver' ? 'Verified Driver' : u.role === 'hybrid' ? 'Driver & Passenger' : 'Campus Passenger';

      return `
        <div class="persona-choice-card ${isSelected ? 'active-choice' : ''}" data-user-id="${u.id}">
          <img src="${escapeHTML(u.avatar)}" alt="${escapeHTML(u.name)}" class="choice-avatar">
          <div class="choice-body">
            <div class="choice-name-row">
              <span class="choice-name">${escapeHTML(u.name)}</span>
              <span class="badge ${isSelected ? 'badge-success' : 'badge-neutral'}">${escapeHTML(roleLabel)}</span>
            </div>
            <span class="choice-sub">${escapeHTML(u.major)}</span>
            <p class="choice-bio">${escapeHTML(u.bio)}</p>
          </div>
          ${isSelected ? '<i data-lucide="check-circle" class="text-emerald"></i>' : ''}
        </div>
      `;
    }).join('');

    list.querySelectorAll('.persona-choice-card').forEach(card => {
      card.addEventListener('click', () => {
        const uid = card.getAttribute('data-user-id');
        switchDemoUser(uid);
      });
    });

    refreshIcons();
  }

  // --- CORE BUSINESS LOGIC ---

  /**
   * Request a seat on a ride
   * Rules:
   * - Cannot book own ride
   * - Cannot request if availableSeats <= 0
   * - Cannot duplicate active request (PENDING or APPROVED)
   * - Pickup stop index must be before dropoff stop index
   */
  function submitSeatRequest(rideId, pickupStop, dropoffStop, note) {
    const ride = getRideById(rideId);
    if (!ride) {
      showToast('Error', 'Carpool not found.', 'danger');
      return false;
    }

    const currentUser = getCurrentUser();

    // Rule: Cannot book own ride
    if (ride.driverId === currentUser.id) {
      showToast('Action Blocked', 'You cannot request a seat on your own offered ride.', 'warning');
      return false;
    }

    // Rule: Cannot book when full
    if (ride.availableSeats <= 0) {
      showToast('Ride Full', 'All seats on this carpool have been claimed.', 'danger');
      return false;
    }

    // Rule: Prevent duplicate active requests
    const existing = state.requests.find(
      r => r.rideId === rideId && r.passengerId === currentUser.id && (r.status === 'PENDING' || r.status === 'APPROVED')
    );
    if (existing) {
      showToast('Duplicate Request', `You already have an active (${existing.status}) request for this ride.`, 'warning');
      return false;
    }

    // Rule: Validate stop order
    const orderedStops = [ride.origin, ...(ride.intermediateStops || []), ride.destination];
    const pickupIdx = orderedStops.indexOf(pickupStop);
    const dropoffIdx = orderedStops.indexOf(dropoffStop);

    if (pickupIdx === -1 || dropoffIdx === -1 || pickupIdx >= dropoffIdx) {
      showToast('Invalid Route Stops', 'Your pickup stop must be strictly before your drop-off stop along the route.', 'danger');
      return false;
    }

    // Create New Request with PENDING status
    const newRequest = {
      id: 'req-' + Date.now(),
      rideId: ride.id,
      passengerId: currentUser.id,
      pickupStop: pickupStop,
      dropoffStop: dropoffStop,
      status: 'PENDING',
      note: note || '',
      createdAt: new Date().toISOString()
    };

    state.requests.unshift(newRequest);

    // Notify Driver
    const driver = getUserById(ride.driverId);
    if (driver) {
      addNotification(
        driver.id,
        'New Seat Request',
        `${currentUser.name} requested a seat on your ride to ${ride.destination}.`,
        'new_request'
      );
    }

    saveState();
    closeModal('request-seat-modal');
    closeModal('ride-details-modal');

    showToast('Seat Requested!', `Request sent to ${driver ? driver.name : 'the driver'}. Status: PENDING.`, 'success');
    renderApp();
    return true;
  }

  /**
   * Driver approves a passenger request
   * Rules:
   * - Only ride owner can approve
   * - Must verify availableSeats > 0 again
   * - Decrement availableSeats exactly once
   * - Prevent duplicate approvals
   */
  function approveRequest(requestId) {
    const req = state.requests.find(r => r.id === requestId);
    if (!req) return;

    const ride = getRideById(req.rideId);
    if (!ride) return;

    const currentUser = getCurrentUser();

    if (ride.driverId !== currentUser.id) {
      showToast('Permission Denied', 'Only the driver who offered this ride can approve requests.', 'danger');
      return;
    }

    if (req.status === 'APPROVED') {
      showToast('Already Approved', 'This passenger is already confirmed for this ride.', 'info');
      return;
    }

    if (ride.availableSeats <= 0) {
      showToast('No Seats Left', 'Cannot approve: All seats are already taken for this carpool.', 'danger');
      return;
    }

    // Decrement available seats exactly once
    ride.availableSeats = Math.max(0, ride.availableSeats - 1);
    req.status = 'APPROVED';

    // Notify Passenger
    const passenger = getUserById(req.passengerId);
    if (passenger) {
      addNotification(
        passenger.id,
        'Booking Approved!',
        `${currentUser.name} approved your seat request for ${ride.destination}!`,
        'approved'
      );
    }

    saveState();
    showToast('Request Approved', `Confirmed seat for ${passenger ? passenger.name : 'passenger'}. (${ride.availableSeats} seat(s) left)`, 'success');
    renderApp();
  }

  /**
   * Driver declines a passenger request
   * Rules:
   * - Only ride owner can reject
   * - Does not change seat count
   */
  function rejectRequest(requestId) {
    const req = state.requests.find(r => r.id === requestId);
    if (!req) return;

    const ride = getRideById(req.rideId);
    if (!ride) return;

    const currentUser = getCurrentUser();
    if (ride.driverId !== currentUser.id) {
      showToast('Permission Denied', 'Only the ride driver can decline requests.', 'danger');
      return;
    }

    req.status = 'REJECTED';

    const passenger = getUserById(req.passengerId);
    if (passenger) {
      addNotification(
        passenger.id,
        'Request Declined',
        `${currentUser.name} was unable to accept your carpool request.`,
        'rejected'
      );
    }

    saveState();
    showToast('Request Declined', 'The passenger has been notified.', 'info');
    renderApp();
  }

  /**
   * Passenger cancels a booking
   * Rules:
   * - If status was APPROVED, restore available seats by 1
   * - If status was PENDING, seats do not change
   * - Mark as CANCELLED
   */
  function cancelBooking(requestId) {
    const req = state.requests.find(r => r.id === requestId);
    if (!req) return;

    const ride = getRideById(req.rideId);
    const currentUser = getCurrentUser();

    if (req.passengerId !== currentUser.id) {
      showToast('Error', 'You can only cancel your own bookings.', 'danger');
      return;
    }

    if (req.status === 'CANCELLED') {
      showToast('Already Cancelled', 'This booking has already been cancelled.', 'info');
      return;
    }

    // Restore seat if was confirmed
    if (req.status === 'APPROVED' && ride) {
      ride.availableSeats = Math.min(ride.totalSeats, ride.availableSeats + 1);
    }

    req.status = 'CANCELLED';

    if (ride) {
      addNotification(
        ride.driverId,
        'Booking Cancelled',
        `${currentUser.name} cancelled their booking on your ride to ${ride.destination}.`,
        'info'
      );
    }

    saveState();
    closeModal('cancel-booking-modal');
    showToast('Booking Cancelled', 'Your request has been cancelled and seats updated.', 'info');
    renderApp();
  }

  /**
   * Offer a Ride (Publishing)
   * Rules:
   * - Validate origin, destination, date, time
   * - Prevent date in the past
   * - Valid seat count (1-4)
   * - Positive total fuel cost
   */
  function publishRide(data) {
    const departureDateTime = new Date(`${data.date}T${data.time}`);
    const now = new Date();
    if (departureDateTime.getTime() < now.getTime() - 120000) {
      showToast('Validation Error', 'Cannot publish a ride departing in the past.', 'danger');
      return false;
    }

    const currentUser = getCurrentUser();
    const newRide = {
      id: 'ride-' + Date.now(),
      driverId: currentUser.id,
      origin: data.origin.trim(),
      destination: data.destination.trim(),
      intermediateStops: data.stops,
      departureDate: data.date,
      departureTime: data.time,
      totalSeats: parseInt(data.seats, 10),
      availableSeats: parseInt(data.seats, 10),
      totalFuelCost: parseFloat(data.totalCost),
      womenOnly: Boolean(data.womenOnly),
      notes: data.notes ? data.notes.trim() : '',
      createdAt: new Date().toISOString()
    };

    state.rides.unshift(newRide);
    saveState();

    showToast('Ride Published!', `Your Bhopal campus carpool to ${newRide.destination} is live.`, 'success');
    switchView('find-rides');
    return true;
  }

  // --- RENDERERS ---

  /**
   * Global Header, Sidebar & Stat Badges
   */
  function renderApp() {
    const user = getCurrentUser();

    // 1. Sidebar Persona Card
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    const sidebarName = document.getElementById('sidebar-user-name');
    const sidebarDept = document.getElementById('sidebar-user-dept');
    const sidebarRoleBadge = document.getElementById('sidebar-role-badge');

    if (sidebarAvatar) sidebarAvatar.src = user.avatar;
    if (sidebarName) sidebarName.textContent = user.name;
    if (sidebarDept) sidebarDept.textContent = user.major.split('•')[0].trim() + ' • ' + (user.major.includes('MANIT') ? 'MANIT' : user.major.includes('Barkatullah') ? 'BU' : 'RGPV');
    if (sidebarRoleBadge) {
      sidebarRoleBadge.textContent = user.role === 'driver' ? 'Driver' : user.role === 'hybrid' ? 'Both' : 'Rider';
    }

    // 2. Topbar Pill
    const topbarAvatar = document.getElementById('topbar-avatar');
    const topbarName = document.getElementById('topbar-user-name');
    const topbarRole = document.getElementById('topbar-user-role');
    const topbarDate = document.getElementById('topbar-current-date');

    if (topbarAvatar) topbarAvatar.src = user.avatar;
    if (topbarName) topbarName.textContent = user.name;
    if (topbarRole) topbarRole.textContent = `${user.role.toUpperCase()} Persona`;
    if (topbarDate) {
      const todayIST = getTodayIST();
      topbarDate.textContent = `${formatHumanDate(todayIST)} • Bhopal (IST)`;
    }

    // 3. Navigation Badge Counts
    const activeRidesCount = state.rides.filter(r => r.availableSeats > 0).length;
    const myBookingsCount = state.requests.filter(r => r.passengerId === user.id && r.status !== 'CANCELLED').length;
    const pendingDriverRequests = state.requests.filter(r => {
      const ride = getRideById(r.rideId);
      return ride && ride.driverId === user.id && r.status === 'PENDING';
    }).length;

    const navRides = document.getElementById('nav-rides-count');
    const navBookings = document.getElementById('nav-bookings-count');
    const navRequests = document.getElementById('nav-requests-count');
    const mobileBookingsDot = document.getElementById('mobile-bookings-dot');
    const mobileRequestsDot = document.getElementById('mobile-requests-dot');

    if (navRides) navRides.textContent = activeRidesCount;
    if (navBookings) {
      navBookings.textContent = myBookingsCount;
      navBookings.style.display = myBookingsCount > 0 ? 'inline-block' : 'none';
    }
    if (navRequests) {
      navRequests.textContent = pendingDriverRequests;
      navRequests.style.display = pendingDriverRequests > 0 ? 'inline-block' : 'none';
    }
    if (mobileBookingsDot) {
      mobileBookingsDot.style.display = myBookingsCount > 0 ? 'block' : 'none';
    }
    if (mobileRequestsDot) {
      mobileRequestsDot.style.display = pendingDriverRequests > 0 ? 'block' : 'none';
    }

    // 4. Update Notifications
    updateNotificationBadges();

    // 5. Active View Refresh
    switchView(state.currentView);
  }

  /**
   * 1. Dashboard View
   */
  function renderDashboard() {
    const user = getCurrentUser();

    // Greeting
    const greeting = document.getElementById('dash-greeting');
    if (greeting) {
      const hour = new Date().getHours();
      const timeGreet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      greeting.textContent = `${timeGreet}, ${user.name.split(' ')[0]}!`;
    }

    // Stats
    const upcomingBookings = state.requests.filter(
      r => r.passengerId === user.id && (r.status === 'APPROVED' || r.status === 'PENDING')
    ).length;

    const offeredRides = state.rides.filter(r => r.driverId === user.id).length;
    const pendingInquiries = state.requests.filter(r => {
      const ride = getRideById(r.rideId);
      return ride && ride.driverId === user.id && r.status === 'PENDING';
    }).length;

    const statBookings = document.getElementById('stat-upcoming-bookings');
    const statMoney = document.getElementById('stat-money-saved');
    const statRides = document.getElementById('stat-rides-completed');
    const statPending = document.getElementById('stat-pending-inquiries');
    const statPendingFooter = document.getElementById('stat-pending-footer');
    const statRoleDesc = document.getElementById('stat-role-desc');

    if (statBookings) statBookings.textContent = upcomingBookings;
    if (statMoney) statMoney.textContent = formatCurrencyINR(user.moneySaved);
    if (statRides) statRides.textContent = user.role === 'driver' ? offeredRides : (upcomingBookings + 4);
    if (statRoleDesc) statRoleDesc.textContent = user.role === 'driver' ? 'Offered Rides Published' : 'Completed Trips';
    if (statPending) statPending.textContent = pendingInquiries;
    if (statPendingFooter) {
      statPendingFooter.innerHTML = user.role === 'driver'
        ? `<span>${pendingInquiries} passenger request${pendingInquiries === 1 ? '' : 's'} to review</span>`
        : `<span>Switch to Driver persona to approve</span>`;
    }

    // Pending driver inquiries alert banner
    const driverAlert = document.getElementById('dashboard-driver-alert');
    if (driverAlert) {
      if (pendingInquiries > 0 && (user.role === 'driver' || user.role === 'hybrid')) {
        driverAlert.style.display = 'block';
        driverAlert.innerHTML = `
          <div class="driver-action-alert-banner">
            <div class="alert-content">
              <i data-lucide="bell-ring" class="alert-icon"></i>
              <div>
                <strong>${pendingInquiries} Seat Request${pendingInquiries === 1 ? '' : 's'} Waiting for Your Review!</strong>
                <span>Students are waiting for your approval to join your Bhopal carpool.</span>
              </div>
            </div>
            <button class="btn btn-sm btn-primary" id="btn-banner-approve-requests">
              <i data-lucide="check-circle"></i> Review & Approve Inquiries
            </button>
          </div>
        `;
        const bannerBtn = driverAlert.querySelector('#btn-banner-approve-requests');
        if (bannerBtn) {
          bannerBtn.addEventListener('click', () => switchView('driver-requests'));
        }
      } else {
        driverAlert.style.display = 'none';
        driverAlert.innerHTML = '';
      }
    }

    const statPendingCard = document.getElementById('stat-card-pending-inquiries');
    if (statPendingCard) {
      statPendingCard.onclick = () => switchView('driver-requests');
    }

    // Available rides preview (first 4)
    const previewContainer = document.getElementById('dashboard-rides-preview');
    if (previewContainer) {
      const topRides = state.rides.slice(0, 4);
      if (topRides.length === 0) {
        previewContainer.innerHTML = `<p class="text-muted">No rides available right now in Bhopal.</p>`;
      } else {
        previewContainer.innerHTML = topRides.map(r => generateRideCardHTML(r)).join('');
        attachRideCardListeners(previewContainer);
      }
    }

    // Activity Feed
    const feed = document.getElementById('dashboard-activity-feed');
    if (feed) {
      const recentReqs = state.requests.slice(0, 4);
      if (recentReqs.length === 0) {
        feed.innerHTML = `<div class="notif-empty">No recent commuter activity in Bhopal.</div>`;
      } else {
        feed.innerHTML = recentReqs.map(req => {
          const p = getUserById(req.passengerId);
          const ride = getRideById(req.rideId);
          if (!ride || !p) return '';

          return `
            <div class="activity-item">
              <img src="${escapeHTML(p.avatar)}" alt="${escapeHTML(p.name)}" class="activity-avatar">
              <div class="activity-content">
                <p class="activity-text">
                  <strong>${escapeHTML(p.name)}</strong> requested a seat to <strong>${escapeHTML(ride.destination)}</strong>.
                </p>
                <span class="activity-time">${formatTimeAgo(req.createdAt)} • Status: <span class="badge ${req.status === 'APPROVED' ? 'badge-success' : req.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}">${req.status}</span></span>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    refreshIcons();
  }

  /**
   * 2. Find Rides View
   */
  function renderFindRides() {
    const container = document.getElementById('find-rides-container');
    const emptyState = document.getElementById('find-rides-empty');
    const countLabel = document.getElementById('rides-found-count');
    const chipsContainer = document.getElementById('active-filter-chips');

    if (!container) return;

    const f = state.searchFilters;

    let filtered = state.rides.filter(ride => {
      if (f.origin && !ride.origin.toLowerCase().includes(f.origin.toLowerCase())) {
        return false;
      }
      if (f.destination && !ride.destination.toLowerCase().includes(f.destination.toLowerCase())) {
        return false;
      }
      if (f.date && ride.departureDate !== f.date) {
        return false;
      }
      if (f.seats !== 'any') {
        const minSeats = parseInt(f.seats, 10);
        if (ride.availableSeats < minSeats) return false;
      }
      if (f.hideFull && ride.availableSeats <= 0) {
        return false;
      }
      const perSeatCost = calculatePerPassengerCost(ride.totalFuelCost, ride.totalSeats);
      if (perSeatCost > f.maxPrice) {
        return false;
      }
      if (f.womenOnly && !ride.womenOnly) {
        return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      if (f.sortBy === 'earliest') {
        const dateA = new Date(`${a.departureDate}T${a.departureTime}`);
        const dateB = new Date(`${b.departureDate}T${b.departureTime}`);
        return dateA - dateB;
      }
      if (f.sortBy === 'price-asc') {
        const costA = calculatePerPassengerCost(a.totalFuelCost, a.totalSeats);
        const costB = calculatePerPassengerCost(b.totalFuelCost, b.totalSeats);
        return costA - costB;
      }
      if (f.sortBy === 'seats-desc') {
        return b.availableSeats - a.availableSeats;
      }
      return 0;
    });

    if (countLabel) {
      countLabel.textContent = `Showing ${filtered.length} available Bhopal campus carpool${filtered.length === 1 ? '' : 's'}`;
    }

    if (chipsContainer) {
      let chipsHtml = '';
      if (f.origin) chipsHtml += `<span class="chip">Hub: ${escapeHTML(f.origin)}</span>`;
      if (f.destination) chipsHtml += `<span class="chip">To: ${escapeHTML(f.destination)}</span>`;
      if (f.date) chipsHtml += `<span class="chip">Date: ${formatHumanDate(f.date)}</span>`;
      if (f.womenOnly) chipsHtml += `<span class="chip">Women-Only</span>`;
      if (f.maxPrice < 250) chipsHtml += `<span class="chip">Max: ₹${f.maxPrice}</span>`;
      chipsContainer.innerHTML = chipsHtml;
    }

    if (filtered.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      container.innerHTML = filtered.map(ride => generateRideCardHTML(ride)).join('');
      attachRideCardListeners(container);
    }

    refreshIcons();
  }

  /**
   * Helper: Generate HTML for single Ride Card in INR
   */
  function generateRideCardHTML(ride) {
    const driver = getUserById(ride.driverId) || {
      name: 'Campus Driver',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      major: 'Student',
      rating: 4.8,
      car: { model: 'Vehicle' }
    };

    const currentUser = getCurrentUser();
    const isOwnRide = ride.driverId === currentUser.id;
    const perSeatCost = calculatePerPassengerCost(ride.totalFuelCost, ride.totalSeats);

    const existingReq = state.requests.find(
      r => r.rideId === ride.id && r.passengerId === currentUser.id && (r.status === 'PENDING' || r.status === 'APPROVED')
    );

    let actionBtnHtml = '';
    if (isOwnRide) {
      const pendingForRide = state.requests.filter(r => r.rideId === ride.id && r.status === 'PENDING').length;
      if (pendingForRide > 0) {
        actionBtnHtml = `<button class="btn btn-sm btn-primary btn-view-ride" data-ride-id="${ride.id}" title="Review pending passenger requests"><i data-lucide="bell-ring"></i> ${pendingForRide} Request${pendingForRide === 1 ? '' : 's'} Waiting</button>`;
      } else {
        actionBtnHtml = `<button class="btn btn-sm btn-outline-forest btn-view-ride" data-ride-id="${ride.id}"><i data-lucide="check-circle"></i> Your Offered Ride</button>`;
      }
    } else if (existingReq) {
      const statusBadge = existingReq.status === 'APPROVED' ? 'badge-success' : 'badge-warning';
      actionBtnHtml = `<button class="btn btn-sm btn-outline-forest" disabled><span class="badge ${statusBadge}">${existingReq.status}</span></button>`;
    } else if (ride.availableSeats <= 0) {
      actionBtnHtml = `<button class="btn btn-sm btn-ghost" disabled>Carpool Full</button>`;
    } else {
      actionBtnHtml = `<button class="btn btn-sm btn-primary btn-request-seat" data-ride-id="${ride.id}"><i data-lucide="ticket"></i> Request Seat</button>`;
    }

    const stopsHtml = ride.intermediateStops && ride.intermediateStops.length > 0
      ? `<div class="intermediate-stops-pills">
           ${ride.intermediateStops.map(s => `<span class="stop-pill"><i data-lucide="milestone"></i> ${escapeHTML(s)}</span>`).join('')}
         </div>`
      : '';

    return `
      <div class="ride-card" data-ride-id="${ride.id}">
        <div class="ride-card-header">
          <div class="driver-mini-profile">
            <img src="${escapeHTML(driver.avatar)}" alt="${escapeHTML(driver.name)}" class="driver-avatar">
            <div class="driver-info-wrap">
              <div class="driver-name-row">
                <span class="driver-name">${escapeHTML(driver.name)}</span>
                <i data-lucide="shield-check" class="verified-badge" title="Verified Bhopal College Student"></i>
              </div>
              <span class="driver-sub-meta">${escapeHTML(driver.major.split('•')[0].trim())} • ★ ${driver.rating}</span>
            </div>
          </div>
          <div class="ride-price-badge">
            <span class="ride-price-val">${formatCurrencyINR(perSeatCost)}</span>
            <span class="ride-price-label">Per Seat</span>
          </div>
        </div>

        <div class="route-timeline">
          <div class="route-stop-node">
            <span class="stop-location-name">${escapeHTML(ride.origin)}</span>
            <span class="stop-meta">${formatHumanDate(ride.departureDate)} at ${formatHumanTime(ride.departureTime)}</span>
          </div>
          ${stopsHtml}
          <div class="route-stop-node node-dest">
            <span class="stop-location-name">${escapeHTML(ride.destination)}</span>
            <span class="stop-meta">Estimated Arrival • Split ${ride.totalSeats + 1}-way</span>
          </div>
        </div>

        <div class="card-tags-row">
          <span class="badge ${ride.availableSeats > 0 ? 'badge-success' : 'badge-danger'}">
            <i data-lucide="users"></i> ${ride.availableSeats} of ${ride.totalSeats} seats open
          </span>
          ${ride.womenOnly ? '<span class="badge badge-emerald"><i data-lucide="shield"></i> Women-Only</span>' : ''}
          ${driver.car ? `<span class="badge badge-neutral"><i data-lucide="car"></i> ${escapeHTML(driver.car.model)}</span>` : ''}
        </div>

        <div class="ride-card-footer">
          <button class="btn btn-sm btn-ghost btn-view-ride" data-ride-id="${ride.id}">
            <i data-lucide="eye"></i> Details
          </button>
          <div style="margin-left:auto;">
            ${actionBtnHtml}
          </div>
        </div>
      </div>
    `;
  }

  function attachRideCardListeners(container) {
    container.querySelectorAll('.btn-view-ride').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rideId = btn.getAttribute('data-ride-id');
        openRideDetailsModal(rideId);
      });
    });

    container.querySelectorAll('.btn-request-seat').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rideId = btn.getAttribute('data-ride-id');
        openSeatRequestModal(rideId);
      });
    });
  }

  /**
   * Open Ride Details Modal in INR
   */
  function openRideDetailsModal(rideId) {
    const ride = getRideById(rideId);
    if (!ride) return;

    const driver = getUserById(ride.driverId) || { name: 'Campus Driver', avatar: '', major: '', car: null, bio: '' };
    const currentUser = getCurrentUser();
    const isOwnRide = ride.driverId === currentUser.id;
    const perSeatCost = calculatePerPassengerCost(ride.totalFuelCost, ride.totalSeats);

    const body = document.getElementById('modal-ride-body');
    const footer = document.getElementById('modal-ride-footer');
    const statusPill = document.getElementById('modal-ride-status-pill');

    if (statusPill) {
      statusPill.textContent = ride.availableSeats > 0 ? `${ride.availableSeats} Seats Available` : 'Full Ride';
      statusPill.className = `modal-badge-pill ${ride.availableSeats > 0 ? 'badge-success' : 'badge-danger'}`;
    }

    const orderedStops = [ride.origin, ...(ride.intermediateStops || []), ride.destination];

    if (body) {
      body.innerHTML = `
        <div style="display:flex; gap:1.25rem; align-items:flex-start; margin-bottom:1.5rem;">
          <img src="${escapeHTML(driver.avatar)}" alt="${escapeHTML(driver.name)}" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid var(--border-subtle);">
          <div style="flex:1;">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h4 style="font-size:1.15rem; font-weight:700; color:var(--text-main);">${escapeHTML(driver.name)}</h4>
              <span class="badge badge-success"><i data-lucide="shield-check"></i> Verified Student</span>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted);">${escapeHTML(driver.major)} • ★ ${driver.rating} (${driver.reviewCount || 10} rides)</p>
            ${driver.car ? `<p style="font-size:0.8rem; color:var(--text-light); margin-top:0.2rem;"><i data-lucide="car"></i> Vehicle: ${escapeHTML(driver.car.model)} (${escapeHTML(driver.car.color || 'Standard')}) • ${escapeHTML(driver.car.plate || '')}</p>` : ''}
            ${driver.bio ? `<p style="font-size:0.8rem; color:var(--text-body); margin-top:0.4rem; font-style:italic;">"${escapeHTML(driver.bio)}"</p>` : ''}
          </div>
        </div>

        <div class="modal-trip-summary">
          <h5 style="font-size:0.85rem; font-weight:700; color:var(--primary-forest); margin-bottom:0.75rem;">Route Waypoints in Bhopal</h5>
          <div class="route-timeline" style="margin-left:0.5rem;">
            ${orderedStops.map((stop, idx) => `
              <div class="route-stop-node ${idx === orderedStops.length - 1 ? 'node-dest' : ''}">
                <span class="stop-location-name">${escapeHTML(stop)}</span>
                <span class="stop-meta">${idx === 0 ? `Origin: ${formatHumanDate(ride.departureDate)} at ${formatHumanTime(ride.departureTime)}` : idx === orderedStops.length - 1 ? 'Destination' : 'Intermediate Pickup Point'}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div style="background:var(--bg-surface-subtle); padding:0.85rem; border-radius:var(--radius-md);">
            <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Fuel Cost Calculation</span>
            <strong style="font-size:1.2rem; color:var(--primary-forest);">${formatCurrencyINR(perSeatCost)}</strong>
            <span style="font-size:0.75rem; color:var(--text-light);"> / seat (${formatCurrencyINR(ride.totalFuelCost)} ÷ ${ride.totalSeats + 1} travelers incl. driver) (est.)</span>
          </div>

          <div style="background:var(--bg-surface-subtle); padding:0.85rem; border-radius:var(--radius-md);">
            <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Carpool Guidelines</span>
            <span style="font-size:0.82rem; font-weight:600; color:var(--text-main);">${ride.womenOnly ? 'Women-Only Commute' : 'Open to All Students'}</span>
          </div>
        </div>

        ${ride.notes ? `
          <div style="background:var(--primary-ultralight); border-left:3px solid var(--primary-accent); padding:0.75rem 1rem; border-radius:0 var(--radius-sm) var(--radius-sm) 0; font-size:0.85rem; color:var(--primary-forest);">
            <strong>Driver's Note:</strong> ${escapeHTML(ride.notes)}
          </div>
        ` : ''}
      `;

      if (isOwnRide) {
        const requestsOnThisRide = state.requests.filter(r => r.rideId === ride.id);
        body.innerHTML += `
          <div class="modal-inquiries-box">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
              <h5 style="font-size:0.95rem; font-weight:700; color:var(--text-main); display:flex; align-items:center; gap:0.4rem;">
                <i data-lucide="inbox"></i> Passenger Inquiries for This Ride (${requestsOnThisRide.length})
              </h5>
              <button type="button" class="btn btn-xs btn-outline-forest" id="btn-modal-go-driver-requests">
                Open Driver Portal <i data-lucide="arrow-right"></i>
              </button>
            </div>
            ${requestsOnThisRide.length === 0 ? `
              <div style="background:var(--bg-surface-subtle); padding:0.85rem; border-radius:var(--radius-md); font-size:0.85rem; color:var(--text-muted); text-align:center;">
                No passenger inquiries yet for this trip.
              </div>
            ` : `
              <div style="display:flex; flex-direction:column; gap:0.75rem;">
                ${requestsOnThisRide.map(req => {
                  const passenger = getUserById(req.passengerId) || { name: 'Campus Student', avatar: '', major: 'Student' };
                  const isActionable = req.status === 'PENDING' && ride.availableSeats > 0;
                  return `
                    <div class="modal-inquiry-row">
                      <div style="display:flex; align-items:center; gap:0.65rem;">
                        <img src="${escapeHTML(passenger.avatar)}" alt="" style="width:38px; height:38px; border-radius:50%; object-fit:cover;">
                        <div>
                          <strong style="font-size:0.9rem; color:var(--text-main); display:block;">${escapeHTML(passenger.name)}</strong>
                          <span style="font-size:0.78rem; color:var(--text-muted);">${escapeHTML(req.pickupStop)} → ${escapeHTML(req.dropoffStop)}</span>
                          ${req.note ? `<p style="font-size:0.75rem; color:var(--text-light); font-style:italic; margin-top:2px;">"${escapeHTML(req.note)}"</p>` : ''}
                        </div>
                      </div>
                      <div style="display:flex; align-items:center; gap:0.5rem; margin-left:auto;">
                        ${isActionable ? `
                          <button type="button" class="btn btn-sm btn-ghost-danger btn-modal-reject" data-request-id="${req.id}">
                            <i data-lucide="x"></i> Decline
                          </button>
                          <button type="button" class="btn btn-sm btn-primary btn-modal-approve" data-request-id="${req.id}">
                            <i data-lucide="check-circle"></i> Approve Request
                          </button>
                        ` : req.status === 'APPROVED' ? `
                          <span class="badge badge-success"><i data-lucide="check"></i> Confirmed Passenger</span>
                        ` : `
                          <span class="badge badge-neutral">${req.status}</span>
                        `}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        `;
      }
    }

    if (footer) {
      if (isOwnRide) {
        footer.innerHTML = `
          <span style="font-size:0.85rem; color:var(--text-muted); margin-right:auto;">
            <i data-lucide="car"></i> You published this ride (${ride.availableSeats} of ${ride.totalSeats} seats open).
          </span>
          <button type="button" class="btn btn-secondary" id="btn-modal-portal-link">
            <i data-lucide="inbox"></i> Driver Requests Portal
          </button>
          <button type="button" class="btn btn-ghost btn-close-modal" data-close="ride-details-modal">Close</button>
        `;
      } else {
        const existingReq = state.requests.find(
          r => r.rideId === ride.id && r.passengerId === currentUser.id && (r.status === 'PENDING' || r.status === 'APPROVED')
        );

        if (existingReq) {
          footer.innerHTML = `
            <span style="font-size:0.85rem; color:var(--text-muted); margin-right:auto;">Status: <strong>${existingReq.status}</strong></span>
            <button type="button" class="btn btn-ghost btn-close-modal" data-close="ride-details-modal">Close</button>
          `;
        } else if (ride.availableSeats <= 0) {
          footer.innerHTML = `
            <span style="font-size:0.85rem; color:var(--rose-600); margin-right:auto;">This carpool is completely full.</span>
            <button type="button" class="btn btn-ghost btn-close-modal" data-close="ride-details-modal">Close</button>
          `;
        } else {
          footer.innerHTML = `
            <button type="button" class="btn btn-ghost btn-close-modal" data-close="ride-details-modal">Back</button>
            <button type="button" class="btn btn-primary" id="btn-modal-open-request" data-ride-id="${ride.id}">
              <i data-lucide="ticket"></i> Request a Seat (${formatCurrencyINR(perSeatCost)})
            </button>
          `;
        }
      }

      footer.querySelectorAll('.btn-close-modal').forEach(b => {
        b.addEventListener('click', () => closeModal('ride-details-modal'));
      });

      if (body) {
        body.querySelectorAll('.btn-modal-approve').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const reqId = btn.getAttribute('data-request-id');
            approveRequest(reqId);
            openRideDetailsModal(ride.id);
          });
        });

        body.querySelectorAll('.btn-modal-reject').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const reqId = btn.getAttribute('data-request-id');
            rejectRequest(reqId);
            openRideDetailsModal(ride.id);
          });
        });

        const jumpBtn1 = body.querySelector('#btn-modal-go-driver-requests');
        if (jumpBtn1) {
          jumpBtn1.addEventListener('click', () => {
            closeModal('ride-details-modal');
            switchView('driver-requests');
          });
        }
      }

      const jumpBtn2 = footer.querySelector('#btn-modal-portal-link');
      if (jumpBtn2) {
        jumpBtn2.addEventListener('click', () => {
          closeModal('ride-details-modal');
          switchView('driver-requests');
        });
      }

      const reqBtn = footer.querySelector('#btn-modal-open-request');
      if (reqBtn) {
        reqBtn.addEventListener('click', () => {
          closeModal('ride-details-modal');
          openSeatRequestModal(ride.id);
        });
      }
    }

    openModal('ride-details-modal');
  }

  /**
   * Open Seat Request Modal with Stop Pickers
   */
  function openSeatRequestModal(rideId) {
    const ride = getRideById(rideId);
    if (!ride) return;

    const currentUser = getCurrentUser();
    if (ride.driverId === currentUser.id) {
      showToast('Action Blocked', 'You cannot request a seat on your own offered ride.', 'warning');
      return;
    }

    const orderedStops = [ride.origin, ...(ride.intermediateStops || []), ride.destination];
    const perSeatCost = calculatePerPassengerCost(ride.totalFuelCost, ride.totalSeats);

    const summary = document.getElementById('request-trip-summary');
    if (summary) {
      summary.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong style="font-size:0.95rem; color:var(--text-main);">${escapeHTML(ride.origin)} → ${escapeHTML(ride.destination)}</strong>
            <span style="display:block; font-size:0.75rem; color:var(--text-muted);">${formatHumanDate(ride.departureDate)} at ${formatHumanTime(ride.departureTime)}</span>
          </div>
          <span class="badge badge-success">${ride.availableSeats} Seat${ride.availableSeats === 1 ? '' : 's'} Open</span>
        </div>
      `;
    }

    const pickupSelect = document.getElementById('request-pickup-stop');
    if (pickupSelect) {
      pickupSelect.innerHTML = orderedStops.slice(0, -1).map((s, idx) => `
        <option value="${escapeHTML(s)}" ${idx === 0 ? 'selected' : ''}>${escapeHTML(s)}</option>
      `).join('');
    }

    const dropoffSelect = document.getElementById('request-dropoff-stop');
    if (dropoffSelect) {
      dropoffSelect.innerHTML = orderedStops.slice(1).map((s, idx) => `
        <option value="${escapeHTML(s)}" ${idx === orderedStops.length - 2 ? 'selected' : ''}>${escapeHTML(s)}</option>
      `).join('');
    }

    const costLabel = document.getElementById('request-modal-cost');
    if (costLabel) costLabel.textContent = formatCurrencyINR(perSeatCost);

    const form = document.getElementById('form-submit-seat-request');
    if (form) {
      form.dataset.rideId = ride.id;
      const noteInput = document.getElementById('request-note');
      if (noteInput) noteInput.value = '';
    }

    openModal('request-seat-modal');
  }

  /**
   * 3. Offer a Ride View (Live Preview synchronization)
   */
  function syncOfferRideDefaults() {
    const user = getCurrentUser();
    const dateInput = document.getElementById('offer-date');
    const timeInput = document.getElementById('offer-time');
    const authorName = document.getElementById('preview-author-name');
    const driverAvatar = document.getElementById('preview-driver-avatar');
    const driverName = document.getElementById('preview-driver-name');
    const driverCar = document.getElementById('preview-driver-car');

    if (dateInput && !dateInput.value) {
      dateInput.min = formatDateOffset(0);
      dateInput.value = formatDateOffset(0);
    }
    if (timeInput && !timeInput.value) {
      timeInput.value = '17:30';
    }

    if (authorName) authorName.textContent = user.name.split(' ')[0];
    if (driverAvatar) driverAvatar.src = user.avatar;
    if (driverName) driverName.textContent = user.name;
    if (driverCar) {
      driverCar.textContent = user.car ? `${user.car.model} (${user.car.color})` : 'Personal Car';
    }

    updateOfferCardPreview();
  }

  function updateOfferCardPreview() {
    const origin = document.getElementById('offer-origin')?.value || 'MANIT Bhopal (Main Gate)';
    const dest = document.getElementById('offer-destination')?.value || 'Rani Kamlapati Railway Station';
    const date = document.getElementById('offer-date')?.value || formatDateOffset(0);
    const time = document.getElementById('offer-time')?.value || '17:30';
    const seats = parseInt(document.getElementById('offer-seats')?.value || '3', 10);
    const totalCost = parseFloat(document.getElementById('offer-total-cost')?.value || '120');
    const womenOnly = document.getElementById('offer-women-only')?.checked || false;

    const perPerson = calculatePerPassengerCost(totalCost, seats);

    const splitDisplay = document.getElementById('offer-calculated-split');
    if (splitDisplay) {
      splitDisplay.innerHTML = `<strong>${formatCurrencyINR(perPerson)}</strong><span>/ passenger</span>`;
    }

    const pOrigin = document.getElementById('preview-origin-text');
    const pDest = document.getElementById('preview-dest-text');
    const pTime = document.getElementById('preview-time-text');
    const pPrice = document.getElementById('preview-price-val');
    const pSeats = document.getElementById('preview-seats-badge');
    const pWomen = document.getElementById('preview-women-badge');
    const pFormula = document.getElementById('preview-split-formula');

    if (pOrigin) pOrigin.textContent = origin;
    if (pDest) pDest.textContent = dest;
    if (pTime) pTime.textContent = `${formatHumanDate(date)}, ${formatHumanTime(time)}`;
    if (pPrice) pPrice.textContent = formatCurrencyINR(perPerson);
    if (pSeats) pSeats.textContent = `${seats} seat${seats === 1 ? '' : 's'} available`;
    if (pWomen) pWomen.style.display = womenOnly ? 'inline-flex' : 'none';
    if (pFormula) {
      pFormula.textContent = `${formatCurrencyINR(totalCost)} total ÷ (${seats} passenger seats + 1 driver) = ${formatCurrencyINR(perPerson)}/person (est.)`;
    }
  }

  /**
   * 4. My Bookings View (Passenger requests list)
   */
  let currentBookingsFilter = 'all';

  function renderMyBookings() {
    const container = document.getElementById('bookings-list-container');
    const emptyState = document.getElementById('bookings-empty');
    if (!container) return;

    const user = getCurrentUser();

    const allUserReqs = state.requests.filter(r => r.passengerId === user.id);
    const countAll = allUserReqs.length;
    const countApproved = allUserReqs.filter(r => r.status === 'APPROVED').length;
    const countPending = allUserReqs.filter(r => r.status === 'PENDING').length;
    const countRejected = allUserReqs.filter(r => r.status === 'REJECTED').length;
    const countCancelled = allUserReqs.filter(r => r.status === 'CANCELLED').length;

    const cAll = document.getElementById('count-tab-all');
    const cApp = document.getElementById('count-tab-approved');
    const cPen = document.getElementById('count-tab-pending');
    const cRej = document.getElementById('count-tab-rejected');
    const cCan = document.getElementById('count-tab-cancelled');

    if (cAll) cAll.textContent = countAll;
    if (cApp) cApp.textContent = countApproved;
    if (cPen) cPen.textContent = countPending;
    if (cRej) cRej.textContent = countRejected;
    if (cCan) cCan.textContent = countCancelled;

    let displayed = allUserReqs;
    if (currentBookingsFilter !== 'all') {
      displayed = allUserReqs.filter(r => r.status === currentBookingsFilter);
    }

    if (displayed.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      container.innerHTML = displayed.map(req => {
        const ride = getRideById(req.rideId);
        const driver = ride ? getUserById(ride.driverId) : null;
        const perSeatCost = ride ? calculatePerPassengerCost(ride.totalFuelCost, ride.totalSeats) : 0;

        let statusClass = 'badge-neutral';
        if (req.status === 'APPROVED') statusClass = 'badge-success';
        if (req.status === 'PENDING') statusClass = 'badge-warning';
        if (req.status === 'REJECTED') statusClass = 'badge-danger';
        if (req.status === 'CANCELLED') statusClass = 'badge-neutral';

        const canCancel = req.status === 'PENDING' || req.status === 'APPROVED';

        return `
          <div class="booking-card" data-request-id="${req.id}">
            <div class="booking-main">
              <div class="booking-status-row">
                <span class="badge ${statusClass}">${req.status}</span>
                <span class="booking-meta-text">Requested ${formatTimeAgo(req.createdAt)}</span>
              </div>
              <div class="booking-route-row">
                <span>${escapeHTML(req.pickupStop)}</span>
                <i data-lucide="arrow-right"></i>
                <span>${escapeHTML(req.dropoffStop)}</span>
              </div>
              <div class="booking-meta-text">
                <i data-lucide="calendar"></i>
                <span>${ride ? formatHumanDate(ride.departureDate) : 'Date N/A'} at ${ride ? formatHumanTime(ride.departureTime) : 'Time N/A'}</span>
              </div>
              ${req.note ? `<p style="font-size:0.78rem; color:var(--text-muted); font-style:italic;">Your note: "${escapeHTML(req.note)}"</p>` : ''}
            </div>

            <div class="booking-driver-col">
              ${driver ? `
                <img src="${escapeHTML(driver.avatar)}" alt="${escapeHTML(driver.name)}" class="driver-avatar">
                <div>
                  <strong style="font-size:0.9rem; color:var(--text-main); display:block;">${escapeHTML(driver.name)}</strong>
                  <span style="font-size:0.75rem; color:var(--text-muted);">${escapeHTML(driver.major.split('•')[0].trim())}</span>
                  ${driver.car ? `<span style="font-size:0.72rem; color:var(--text-light); display:block;"><i data-lucide="car"></i> ${escapeHTML(driver.car.model)}</span>` : ''}
                </div>
              ` : `<span>Driver unavailable</span>`}
            </div>

            <div class="booking-actions-col">
              <div style="text-align:right;">
                <strong style="font-size:1.25rem; color:var(--primary-forest);">${formatCurrencyINR(perSeatCost)}</strong>
                <span style="display:block; font-size:0.7rem; color:var(--text-light);">Est. fuel share</span>
              </div>
              ${canCancel ? `
                <button class="btn btn-sm btn-ghost-danger btn-open-cancel" data-request-id="${req.id}">
                  <i data-lucide="x"></i> Cancel Booking
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.btn-open-cancel').forEach(b => {
        b.addEventListener('click', () => {
          const rid = b.getAttribute('data-request-id');
          openCancelConfirmationModal(rid);
        });
      });
    }

    refreshIcons();
  }

  function openCancelConfirmationModal(requestId) {
    const req = state.requests.find(r => r.id === requestId);
    if (!req) return;
    const ride = getRideById(req.rideId);

    state.pendingCancelRequestId = requestId;
    const preview = document.getElementById('cancel-preview-info');
    if (preview) {
      preview.innerHTML = `
        <strong>${escapeHTML(req.pickupStop)} → ${escapeHTML(req.dropoffStop)}</strong><br>
        <span>Departing: ${ride ? formatHumanDate(ride.departureDate) : ''} (${req.status} status)</span>
      `;
    }
    openModal('cancel-booking-modal');
  }

  /**
   * 5. Driver Request Management View
   */
  function renderDriverRequests() {
    const container = document.getElementById('driver-requests-container');
    const emptyState = document.getElementById('driver-requests-empty');
    const activeCountLabel = document.getElementById('driver-active-rides-count');
    const rideSelect = document.getElementById('driver-select-ride');
    const statusFilter = document.getElementById('driver-status-filter')?.value || 'all';

    if (!container) return;

    const user = getCurrentUser();

    const driverRides = state.rides.filter(r => r.driverId === user.id);
    if (activeCountLabel) {
      activeCountLabel.textContent = `${driverRides.length} Offered Ride${driverRides.length === 1 ? '' : 's'}`;
    }

    // Refresh Ride Selector options for current driver
    if (rideSelect) {
      const prevVal = rideSelect.value;
      rideSelect.innerHTML = '<option value="all">All My Offered Rides</option>';
      driverRides.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = `${r.origin} → ${r.destination} (${formatHumanDate(r.departureDate)})`;
        if (r.id === prevVal) opt.selected = true;
        rideSelect.appendChild(opt);
      });
    }

    const selectedRideId = rideSelect ? rideSelect.value : 'all';

    let requestsForDriver = state.requests.filter(req => {
      const ride = getRideById(req.rideId);
      if (!ride || ride.driverId !== user.id) return false;
      if (selectedRideId !== 'all' && req.rideId !== selectedRideId) return false;
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;
      return true;
    });

    // Sort requests: PENDING requests first, then newest
    requestsForDriver.sort((a, b) => {
      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
      if (b.status === 'PENDING' && a.status !== 'PENDING') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    if (requestsForDriver.length === 0) {
      container.innerHTML = '';
      if (emptyState) {
        emptyState.style.display = 'block';
        const emptyTitle = emptyState.querySelector('.empty-title');
        const emptyDesc = emptyState.querySelector('.empty-desc');
        const showAllBtn = document.getElementById('btn-empty-show-all-requests');

        const allDriverReqs = state.requests.filter(req => {
          const ride = getRideById(req.rideId);
          return ride && ride.driverId === user.id;
        });

        if (allDriverReqs.length > 0 && statusFilter !== 'all') {
          if (emptyTitle) emptyTitle.textContent = `No ${statusFilter === 'PENDING' ? 'pending' : statusFilter} requests right now`;
          if (emptyDesc) emptyDesc.textContent = `You have ${allDriverReqs.length} other request(s) on your carpools. Switch filter to view them.`;
          if (showAllBtn) showAllBtn.style.display = 'inline-flex';
        } else {
          if (emptyTitle) emptyTitle.textContent = 'No ride requests right now';
          if (emptyDesc) emptyDesc.textContent = "You're all caught up! When students request seats on your Bhopal carpools, they will appear here for your approval.";
          if (showAllBtn) showAllBtn.style.display = 'none';
        }
      }
    } else {
      if (emptyState) emptyState.style.display = 'none';
      container.innerHTML = requestsForDriver.map(req => {
        const ride = getRideById(req.rideId);
        const passenger = getUserById(req.passengerId) || { name: 'Campus Student', avatar: '', major: 'Student' };
        const perSeatCost = ride ? calculatePerPassengerCost(ride.totalFuelCost, ride.totalSeats) : 0;

        let statusBadge = 'badge-neutral';
        if (req.status === 'APPROVED') statusBadge = 'badge-success';
        if (req.status === 'PENDING') statusBadge = 'badge-warning';
        if (req.status === 'REJECTED') statusBadge = 'badge-danger';
        if (req.status === 'CANCELLED') statusBadge = 'badge-neutral';

        const isActionable = req.status === 'PENDING' && ride && ride.availableSeats > 0;
        const cardHighlight = req.status === 'PENDING' ? 'request-pending-highlight' : '';

        return `
          <div class="request-item-card ${cardHighlight}" data-request-id="${req.id}">
            <div class="request-item-header">
              <div class="passenger-profile-row">
                <img src="${escapeHTML(passenger.avatar)}" alt="${escapeHTML(passenger.name)}" class="passenger-avatar">
                <div>
                  <div style="display:flex; align-items:center; gap:0.4rem;">
                    <span class="passenger-name">${escapeHTML(passenger.name)}</span>
                    <i data-lucide="shield-check" class="verified-badge" title="Verified College Student"></i>
                  </div>
                  <span class="passenger-major">${escapeHTML(passenger.major.split('•')[0].trim())} • ★ ${passenger.rating || '5.0'}</span>
                </div>
              </div>

              <div style="text-align:right;">
                <span class="badge ${statusBadge}">${req.status === 'PENDING' ? '⚡ PENDING REVIEW' : req.status}</span>
                <span style="font-size:0.75rem; color:var(--text-light); display:block; margin-top:2px;">${formatTimeAgo(req.createdAt)}</span>
              </div>
            </div>

            <div class="request-trip-context">
              <div>
                <strong style="font-size:0.9rem; color:var(--primary-forest); display:block;">Requested Route in Bhopal:</strong>
                <span style="font-size:0.85rem; color:var(--text-main); font-weight:600;">${escapeHTML(req.pickupStop)} → ${escapeHTML(req.dropoffStop)}</span>
              </div>

              <div style="text-align:right;">
                <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Ride Capacity</span>
                <strong style="font-size:0.9rem; color:var(--text-main);">${ride ? `${ride.availableSeats} of ${ride.totalSeats} seats open` : 'N/A'}</strong>
              </div>
            </div>

            ${req.note ? `
              <div class="request-note-quote">
                "${escapeHTML(req.note)}"
              </div>
            ` : ''}

            <div class="request-actions-row">
              <div style="margin-right:auto; font-size:0.8rem; color:var(--text-muted);">
                Fuel Contribution: <strong>${formatCurrencyINR(perSeatCost)}</strong>
              </div>

              ${isActionable ? `
                <button class="btn btn-sm btn-ghost-danger btn-driver-reject" data-request-id="${req.id}">
                  <i data-lucide="x"></i> Decline
                </button>
                <button class="btn btn-sm btn-primary btn-driver-approve" data-request-id="${req.id}">
                  <i data-lucide="check-circle"></i> Approve Request
                </button>
              ` : req.status === 'APPROVED' ? `
                <span style="font-size:0.82rem; font-weight:600; color:var(--emerald-600);"><i data-lucide="check-circle"></i> Confirmed & Added to Trip Manifest</span>
              ` : req.status === 'PENDING' && ride && ride.availableSeats <= 0 ? `
                <span style="font-size:0.82rem; font-weight:600; color:var(--rose-600);">Cannot accept: Ride is full</span>
                <button class="btn btn-sm btn-ghost-danger btn-driver-reject" data-request-id="${req.id}">Decline</button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.btn-driver-approve').forEach(b => {
        b.addEventListener('click', () => {
          const reqId = b.getAttribute('data-request-id');
          approveRequest(reqId);
        });
      });

      container.querySelectorAll('.btn-driver-reject').forEach(b => {
        b.addEventListener('click', () => {
          const reqId = b.getAttribute('data-request-id');
          rejectRequest(reqId);
        });
      });
    }

    refreshIcons();
  }

  /**
   * 6. History View
   */
  function renderHistory() {
    const container = document.getElementById('history-timeline-container');
    const emptyState = document.getElementById('history-empty');
    if (!container) return;

    const user = getCurrentUser();

    const pastTrips = state.requests.filter(r => r.passengerId === user.id && (r.status === 'CANCELLED' || r.status === 'APPROVED'));

    if (pastTrips.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      container.innerHTML = pastTrips.map(req => {
        const ride = getRideById(req.rideId);
        const perSeatCost = ride ? calculatePerPassengerCost(ride.totalFuelCost, ride.totalSeats) : 0;
        const isCompleted = req.status === 'APPROVED';

        return `
          <div class="history-card">
            <div class="history-badge-date">
              <div class="history-date-box">
                <span>${ride ? formatHumanDate(ride.departureDate) : 'Recent'}</span>
              </div>
              <div>
                <strong style="font-size:0.95rem; color:var(--text-main); display:block;">${escapeHTML(req.pickupStop)} → ${escapeHTML(req.dropoffStop)}</strong>
                <span style="font-size:0.75rem; color:var(--text-muted);">${ride ? `${ride.origin} to ${ride.destination}` : 'Bhopal campus route'}</span>
              </div>
            </div>

            <div class="history-receipt-stats">
              <div class="receipt-stat-col">
                <span class="badge ${isCompleted ? 'badge-success' : 'badge-neutral'}">${isCompleted ? 'Completed' : 'Cancelled'}</span>
              </div>
              <div class="receipt-stat-col">
                <strong>${isCompleted ? '2.8 kg' : '0.0 kg'}</strong>
                <span>CO₂ Prevented</span>
              </div>
              <div class="receipt-stat-col">
                <strong>${isCompleted ? formatCurrencyINR(perSeatCost) : formatCurrencyINR(0)}</strong>
                <span>Fuel Reimbursement</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    refreshIcons();
  }

  /**
   * 7. Profile Form
   */
  function renderProfileForm() {
    const user = getCurrentUser();

    const dAvatar = document.getElementById('profile-display-avatar');
    const dName = document.getElementById('profile-display-name');
    const dMajor = document.getElementById('profile-display-major');
    const dRole = document.getElementById('profile-display-role-badge');
    const dRating = document.getElementById('profile-display-rating');

    if (dAvatar) dAvatar.src = user.avatar;
    if (dName) dName.textContent = user.name;
    if (dMajor) dMajor.textContent = user.major;
    if (dRole) dRole.textContent = user.role.toUpperCase();
    if (dRating) dRating.textContent = `★ ${user.rating} (${user.reviewCount || 15} reviews)`;

    const nameInput = document.getElementById('profile-name');
    const majorInput = document.getElementById('profile-major');
    const phoneInput = document.getElementById('profile-phone');
    const emailInput = document.getElementById('profile-email');
    const bioInput = document.getElementById('profile-bio');
    const carModelInput = document.getElementById('profile-car-model');
    const carColorInput = document.getElementById('profile-car-color');
    const carPlateInput = document.getElementById('profile-plate');
    const womenOnlyPref = document.getElementById('profile-women-only-pref');

    if (nameInput) nameInput.value = user.name || '';
    if (majorInput) majorInput.value = user.major || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (emailInput) emailInput.value = user.email || '';
    if (bioInput) bioInput.value = user.bio || '';
    if (carModelInput) carModelInput.value = user.car ? user.car.model : '';
    if (carColorInput) carColorInput.value = user.car ? user.car.color : '';
    if (carPlateInput) carPlateInput.value = user.car ? user.car.plate : '';
    if (womenOnlyPref) womenOnlyPref.checked = Boolean(user.womenOnlyPref);

    refreshIcons();
  }

  // --- FORM SUBMISSIONS & EVENT LISTENERS ---

  function attachGlobalListeners() {
    // 1. Navigation Links
    document.querySelectorAll('[data-view]').forEach(elem => {
      elem.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = elem.getAttribute('data-view');
        switchView(targetView);
      });
    });

    // Mobile Sidebar Drawer Toggle
    const mobileToggle = document.getElementById('mobile-sidebar-toggle');
    const mobileClose = document.getElementById('mobile-sidebar-close');
    const sidebar = document.getElementById('sidebar');

    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener('click', () => sidebar.classList.add('open'));
    }
    if (mobileClose && sidebar) {
      mobileClose.addEventListener('click', () => sidebar.classList.remove('open'));
    }

    // 2. Demo Persona Switcher Modal Triggers
    const openPersonaBtn = document.getElementById('btn-open-persona-modal');
    const quickSwitchBtn = document.getElementById('btn-quick-switch-persona');
    const topbarUserBtn = document.getElementById('topbar-user-menu-btn');

    [openPersonaBtn, quickSwitchBtn, topbarUserBtn].forEach(b => {
      if (b) {
        b.addEventListener('click', () => {
          renderPersonaModal();
          openModal('persona-switch-modal');
        });
      }
    });

    // 3. Reset Demo Data Triggers
    const resetSidebarBtn = document.getElementById('btn-reset-demo');
    const resetProfileBtn = document.getElementById('btn-profile-reset-demo');
    const resetModalBtn = document.getElementById('btn-modal-reset-demo');

    [resetSidebarBtn, resetProfileBtn, resetModalBtn].forEach(b => {
      if (b) {
        b.addEventListener('click', () => {
          if (confirm('Reset application to original Bhopal demo state? All test bookings and added rides will be reset.')) {
            closeModal('persona-switch-modal');
            resetToSeedData(true);
          }
        });
      }
    });

    // 4. Notification Panel Toggle
    const notifToggle = document.getElementById('btn-notifications-toggle');
    const notifPanel = document.getElementById('notifications-panel');
    const markAllBtn = document.getElementById('btn-mark-all-read');

    if (notifToggle && notifPanel) {
      notifToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isShown = notifPanel.classList.contains('show');
        if (!isShown) {
          renderNotificationList();
          notifPanel.classList.add('show');
          notifToggle.setAttribute('aria-expanded', 'true');
        } else {
          notifPanel.classList.remove('show');
          notifToggle.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('click', (e) => {
        if (!notifPanel.contains(e.target) && !notifToggle.contains(e.target)) {
          notifPanel.classList.remove('show');
          notifToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => {
        markAllNotificationsRead();
      });
    }

    // 5. Dashboard Quick Actions
    const heroFindBtn = document.getElementById('btn-hero-find-ride');
    const heroOfferBtn = document.getElementById('btn-hero-offer-ride');
    const seeAllBtn = document.getElementById('btn-see-all-rides');

    if (heroFindBtn) heroFindBtn.addEventListener('click', () => switchView('find-rides'));
    if (heroOfferBtn) heroOfferBtn.addEventListener('click', () => switchView('offer-ride'));
    if (seeAllBtn) seeAllBtn.addEventListener('click', () => switchView('find-rides'));

    // Dashboard Quick Search Form
    const dashSearchForm = document.getElementById('dash-quick-search-form');
    if (dashSearchForm) {
      dashSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fromVal = document.getElementById('dash-search-from')?.value || '';
        const toVal = document.getElementById('dash-search-to')?.value || '';
        const dateVal = document.getElementById('dash-search-date')?.value || '';

        state.searchFilters.origin = fromVal;
        state.searchFilters.destination = toVal;
        state.searchFilters.date = dateVal;

        const fOrigin = document.getElementById('filter-origin');
        const fDest = document.getElementById('filter-destination');
        const fDate = document.getElementById('filter-date');
        if (fOrigin) fOrigin.value = fromVal;
        if (fDest) fDest.value = toVal;
        if (fDate) fDate.value = dateVal;

        switchView('find-rides');
      });
    }

    // Topbar Search
    const topbarSearch = document.getElementById('topbar-quick-search');
    if (topbarSearch) {
      topbarSearch.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          state.searchFilters.destination = topbarSearch.value;
          const fDest = document.getElementById('filter-destination');
          if (fDest) fDest.value = topbarSearch.value;
          switchView('find-rides');
        }
      });
    }

    // 6. Find Rides Filter Controls
    const fOrigin = document.getElementById('filter-origin');
    const fDest = document.getElementById('filter-destination');
    const fDate = document.getElementById('filter-date');
    const fSeats = document.getElementById('filter-seats');
    const fPrice = document.getElementById('filter-max-price');
    const fPriceLabel = document.getElementById('price-slider-label');
    const fSort = document.getElementById('filter-sort');
    const fWomen = document.getElementById('filter-women-only');
    const fHideFull = document.getElementById('filter-hide-full');
    const clearFiltersBtn = document.getElementById('btn-clear-filters');
    const emptyClearBtn = document.getElementById('btn-empty-clear');
    const emptyOfferBtn = document.getElementById('btn-empty-offer');
    const switchToOfferBtn = document.getElementById('btn-switch-to-offer');

    const updateFilters = () => {
      if (fOrigin) state.searchFilters.origin = fOrigin.value;
      if (fDest) state.searchFilters.destination = fDest.value;
      if (fDate) state.searchFilters.date = fDate.value;
      if (fSeats) state.searchFilters.seats = fSeats.value;
      if (fPrice) {
        state.searchFilters.maxPrice = parseFloat(fPrice.value);
        if (fPriceLabel) fPriceLabel.textContent = `₹${fPrice.value}`;
      }
      if (fSort) state.searchFilters.sortBy = fSort.value;
      if (fWomen) state.searchFilters.womenOnly = fWomen.checked;
      if (fHideFull) state.searchFilters.hideFull = fHideFull.checked;

      renderFindRides();
    };

    [fOrigin, fDest].forEach(input => {
      if (input) input.addEventListener('input', updateFilters);
    });

    [fDate, fSeats, fSort, fWomen, fHideFull].forEach(elem => {
      if (elem) elem.addEventListener('change', updateFilters);
    });

    if (fPrice) {
      fPrice.addEventListener('input', updateFilters);
    }

    const resetFilterValues = () => {
      state.searchFilters = {
        origin: '',
        destination: '',
        date: '',
        seats: 'any',
        maxPrice: 200,
        womenOnly: false,
        hideFull: true,
        sortBy: 'earliest'
      };
      if (fOrigin) fOrigin.value = '';
      if (fDest) fDest.value = '';
      if (fDate) fDate.value = '';
      if (fSeats) fSeats.value = 'any';
      if (fPrice) {
        fPrice.value = 150;
        if (fPriceLabel) fPriceLabel.textContent = '₹150';
      }
      if (fSort) fSort.value = 'earliest';
      if (fWomen) fWomen.checked = false;
      if (fHideFull) fHideFull.checked = true;
      renderFindRides();
    };

    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', resetFilterValues);
    if (emptyClearBtn) emptyClearBtn.addEventListener('click', resetFilterValues);
    if (emptyOfferBtn) emptyOfferBtn.addEventListener('click', () => switchView('offer-ride'));
    if (switchToOfferBtn) switchToOfferBtn.addEventListener('click', () => switchView('offer-ride'));

    // 7. Offer a Ride Form Validation & Real-time Preview
    const offerForm = document.getElementById('offer-ride-form');
    const offerOrigin = document.getElementById('offer-origin');
    const offerDest = document.getElementById('offer-destination');
    const offerDate = document.getElementById('offer-date');
    const offerTime = document.getElementById('offer-time');
    const offerSeats = document.getElementById('offer-seats');
    const offerCost = document.getElementById('offer-total-cost');
    const offerWomen = document.getElementById('offer-women-only');
    const resetOfferBtn = document.getElementById('btn-reset-offer-form');

    [offerOrigin, offerDest, offerDate, offerTime, offerSeats, offerCost, offerWomen].forEach(ctrl => {
      if (ctrl) {
        ctrl.addEventListener('input', updateOfferCardPreview);
        ctrl.addEventListener('change', updateOfferCardPreview);
      }
    });

    if (resetOfferBtn) {
      resetOfferBtn.addEventListener('click', () => {
        if (offerForm) offerForm.reset();
        syncOfferRideDefaults();
      });
    }

    if (offerForm) {
      offerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;
        const errOrigin = document.getElementById('error-offer-origin');
        const errDest = document.getElementById('error-offer-destination');
        const errDate = document.getElementById('error-offer-date');
        const errTime = document.getElementById('error-offer-time');
        const errSeats = document.getElementById('error-offer-seats');
        const errCost = document.getElementById('error-offer-total-cost');

        [errOrigin, errDest, errDate, errTime, errSeats, errCost].forEach(err => {
          if (err) err.textContent = '';
        });

        if (!offerOrigin.value.trim()) {
          if (errOrigin) errOrigin.textContent = 'Please specify a pickup hub in Bhopal.';
          isValid = false;
        }

        if (!offerDest.value.trim()) {
          if (errDest) errDest.textContent = 'Please specify a destination in Bhopal.';
          isValid = false;
        }

        if (!offerDate.value) {
          if (errDate) errDate.textContent = 'Please select a departure date.';
          isValid = false;
        }

        if (!offerTime.value) {
          if (errTime) errTime.textContent = 'Please select a departure time.';
          isValid = false;
        }

        const totalCostVal = parseFloat(offerCost.value);
        if (isNaN(totalCostVal) || totalCostVal < 0) {
          if (errCost) errCost.textContent = 'Fuel cost cannot be negative.';
          isValid = false;
        }

        if (!isValid) return;

        const stopsRaw = document.getElementById('offer-intermediate-stops')?.value || '';
        const stops = stopsRaw
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        const notesVal = document.getElementById('offer-notes')?.value || '';

        const success = publishRide({
          origin: offerOrigin.value,
          destination: offerDest.value,
          stops: stops,
          date: offerDate.value,
          time: offerTime.value,
          seats: offerSeats.value,
          totalCost: totalCostVal,
          womenOnly: offerWomen.checked,
          notes: notesVal
        });

        if (success) {
          offerForm.reset();
        }
      });
    }

    // 8. Seat Request Form Submission
    const requestForm = document.getElementById('form-submit-seat-request');
    if (requestForm) {
      requestForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const rideId = requestForm.dataset.rideId;
        const pickupStop = document.getElementById('request-pickup-stop')?.value;
        const dropoffStop = document.getElementById('request-dropoff-stop')?.value;
        const note = document.getElementById('request-note')?.value;

        submitSeatRequest(rideId, pickupStop, dropoffStop, note);
      });
    }

    // 9. My Bookings Tabs
    document.querySelectorAll('.tab-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.tab-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentBookingsFilter = pill.getAttribute('data-filter');
        renderMyBookings();
      });
    });

    const bookingsFindMore = document.getElementById('btn-bookings-find-more');
    const emptyBrowseRides = document.getElementById('btn-empty-browse-rides');
    if (bookingsFindMore) bookingsFindMore.addEventListener('click', () => switchView('find-rides'));
    if (emptyBrowseRides) emptyBrowseRides.addEventListener('click', () => switchView('find-rides'));

    // Cancel Booking Modal Action
    const confirmCancelBtn = document.getElementById('btn-confirm-cancel-booking');
    if (confirmCancelBtn) {
      confirmCancelBtn.addEventListener('click', () => {
        if (state.pendingCancelRequestId) {
          cancelBooking(state.pendingCancelRequestId);
          state.pendingCancelRequestId = null;
        }
      });
    }

    // 10. Driver Request Filter Toolbar
    const driverRideSelect = document.getElementById('driver-select-ride');
    const driverStatusFilter = document.getElementById('driver-status-filter');
    const driverOfferAnother = document.getElementById('btn-empty-offer-another');

    if (driverRideSelect) driverRideSelect.addEventListener('change', renderDriverRequests);
    if (driverStatusFilter) driverStatusFilter.addEventListener('change', renderDriverRequests);
    if (driverOfferAnother) driverOfferAnother.addEventListener('click', () => switchView('offer-ride'));

    const driverShowAll = document.getElementById('btn-empty-show-all-requests');
    if (driverShowAll) {
      driverShowAll.addEventListener('click', () => {
        if (driverStatusFilter) driverStatusFilter.value = 'all';
        renderDriverRequests();
      });
    }

    // 11. Campus Hubs - "Find Rides from Here"
    document.querySelectorAll('.btn-filter-hub').forEach(btn => {
      btn.addEventListener('click', () => {
        const hubName = btn.getAttribute('data-hub');
        state.searchFilters.origin = hubName;
        const fOriginInput = document.getElementById('filter-origin');
        if (fOriginInput) fOriginInput.value = hubName;
        switchView('find-rides');
      });
    });

    // 12. Profile Edit Form Submission
    const profileForm = document.getElementById('profile-edit-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = getCurrentUser();

        const nameInput = document.getElementById('profile-name');
        const majorInput = document.getElementById('profile-major');
        const phoneInput = document.getElementById('profile-phone');
        const bioInput = document.getElementById('profile-bio');
        const carModel = document.getElementById('profile-car-model');
        const carColor = document.getElementById('profile-car-color');
        const carPlate = document.getElementById('profile-plate');
        const womenOnlyPref = document.getElementById('profile-women-only-pref');

        if (nameInput) user.name = nameInput.value.trim();
        if (majorInput) user.major = majorInput.value.trim();
        if (phoneInput) user.phone = phoneInput.value.trim();
        if (bioInput) user.bio = bioInput.value.trim();

        if (carModel && carModel.value.trim()) {
          user.car = {
            model: carModel.value.trim(),
            color: carColor ? carColor.value.trim() : '',
            plate: carPlate ? carPlate.value.trim() : ''
          };
          user.role = 'driver';
        }

        if (womenOnlyPref) user.womenOnlyPref = womenOnlyPref.checked;

        saveState();

        const feedback = document.getElementById('profile-save-feedback');
        if (feedback) {
          feedback.textContent = '✓ Saved successfully!';
          setTimeout(() => { feedback.textContent = ''; }, 3000);
        }

        showToast('Profile Updated', 'Your commuter preferences have been saved.', 'success');
        renderApp();
      });
    }

    // 13. Modal Close Buttons and Backdrop Click
    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close');
        closeModal(modalId);
      });
    });

    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal.id);
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.activeModal) {
        closeModal(state.activeModal);
      }
    });
  }

  // --- INITIALIZATION ---

  function initApp() {
    loadState();
    attachGlobalListeners();
    renderApp();
    refreshIcons();
    runGSAPEntrance();
    console.log('RideLink initialized successfully. Running in BHOPAL DEMO mode.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
