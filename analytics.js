(function initAnalytics() {
  var measurementId = window.GA_MEASUREMENT_ID;

  if (!measurementId || measurementId === "G-XXXXXXXXXX") {
    console.warn("[Analytics] Missing GA_MEASUREMENT_ID. Set it in analytics-config.js");
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: true,
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname
  });

  function normalizeNumber(value, fallback) {
    var n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function normalizePrice(value) {
    var n = normalizeNumber(value, 0);
    return Math.max(0, Math.round(n));
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function mapPrimaryCategory(rawCategory) {
    var code = String(rawCategory || "").toLowerCase();
    var map = {
      cg1: "Kinh te - Quan tri",
      cg2: "CNTT - Ky thuat",
      cg3: "Luat - Xa hoi",
      cg4: "Ngoai ngu"
    };
    return map[code] || (rawCategory ? String(rawCategory) : "general");
  }

  function inferDetailedCategory(rawCategory, itemName) {
    var categoryCode = String(rawCategory || "").toLowerCase();
    var text = normalizeText(itemName);

    if (categoryCode === "cg1") {
      if (/(kinh te|vi mo|vi mo|tai chinh|ke toan)/.test(text)) return "Kinh te - Tai chinh";
      if (/(marketing|quan tri|chien luoc)/.test(text)) return "Quan tri - Marketing";
      return "Kinh te - Tong hop";
    }

    if (categoryCode === "cg2") {
      if (/(lap trinh|java|c\b|c\+\+|python|thuat toan|du lieu)/.test(text)) return "Lap trinh - Phan mem";
      if (/(co so du lieu|sql|database)/.test(text)) return "Du lieu - Co so du lieu";
      if (/(mang|he dieu hanh|ai|tri tue nhan tao)/.test(text)) return "He thong - Mang - AI";
      if (/(ky thuat|dien tu|ky thuat so)/.test(text)) return "Ky thuat - Dien tu";
      return "CNTT - Ky thuat tong hop";
    }

    if (categoryCode === "cg3") {
      if (/(luat|phap luat|dan su|thuong mai|lao dong)/.test(text)) return "Luat";
      if (/(xa hoi|tam ly|tranh bien|hanh chinh|quan he cong chung)/.test(text)) return "Xa hoi - Ky nang";
      return "Luat - Xa hoi tong hop";
    }

    if (categoryCode === "cg4") {
      if (/(toeic|ielts|academic writing)/.test(text)) return "Tieng Anh hoc thuat";
      if (/(giao tiep|ngu phap|tu vung)/.test(text)) return "Tieng Anh giao tiep";
      if (/(trung|nhat|han)/.test(text)) return "Ngoai ngu chau A";
      return "Ngoai ngu tong hop";
    }

    if (/(toeic|ielts|english|tieng anh|ngoai ngu)/.test(text)) return "Ngoai ngu";
    if (/(luat|phap luat|xa hoi|tam ly)/.test(text)) return "Luat - Xa hoi";
    if (/(lap trinh|cntt|du lieu|thuat toan|java|python)/.test(text)) return "CNTT - Ky thuat";
    if (/(kinh te|quan tri|marketing|tai chinh|ke toan)/.test(text)) return "Kinh te - Quan tri";
    return "general";
  }

  function inferItemVariant(itemName) {
    var text = normalizeText(itemName);
    if (/(nang cao|advanced)/.test(text)) return "advanced";
    if (/(can ban|co ban|nhap mon|basic)/.test(text)) return "basic";
    if (/(de cuong)/.test(text)) return "de_cuong";
    if (/(bo de|trac nghiem)/.test(text)) return "bo_de_trac_nghiem";
    if (/(do an)/.test(text)) return "do_an";
    return "standard";
  }

  function canUseSessionStorage() {
    try {
      return typeof window.sessionStorage !== "undefined";
    } catch (error) {
      return false;
    }
  }

  function getPurchaseStorageKey(transactionId) {
    return "ga4_purchase_tracked_" + String(transactionId);
  }

  function hasTrackedPurchase(transactionId) {
    if (!transactionId || !canUseSessionStorage()) return false;
    return window.sessionStorage.getItem(getPurchaseStorageKey(transactionId)) === "1";
  }

  function markTrackedPurchase(transactionId) {
    if (!transactionId || !canUseSessionStorage()) return;
    window.sessionStorage.setItem(getPurchaseStorageKey(transactionId), "1");
  }

  function toGaItem(product, quantity) {
    if (!product) return null;

    var rawQty = quantity != null ? quantity : (product.quantity != null ? product.quantity : 1);
    var qty = Math.max(1, Math.round(normalizeNumber(rawQty, 1)));
    var price = normalizePrice(product.price != null ? product.price : product.product_price);
    var rawCategory = product.category || product.product_category || "general";
    var itemName = String(product.name || product.product_name || "Unknown item");

    return {
      item_id: String(product.id != null ? product.id : (product.product_id != null ? product.product_id : "unknown")),
      item_name: itemName,
      item_category: mapPrimaryCategory(rawCategory),
      item_category2: inferDetailedCategory(rawCategory, itemName),
      item_variant: inferItemVariant(itemName),
      price: price,
      quantity: qty
    };
  }

  function toGaItems(items) {
    if (!Array.isArray(items)) return [];
    return items
      .map(function (item) { return toGaItem(item); })
      .filter(function (item) { return !!item; });
  }

  function computeValue(items) {
    return items.reduce(function (sum, item) {
      return sum + normalizePrice(item.price) * normalizeNumber(item.quantity, 1);
    }, 0);
  }

  function trackEvent(name, params) {
    try {
      if (!name || typeof window.gtag !== "function") return;
      window.gtag("event", name, params || {});
    } catch (error) {
      console.warn("[Analytics] Track event failed:", name, error);
    }
  }

  function canUseStorage(type) {
    try {
      var storage = window[type];
      if (!storage) return false;
      var testKey = "__studyhub_test__";
      storage.setItem(testKey, "1");
      storage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  function generateSessionId() {
    var rand = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
    return "Case" + rand;
  }

  function getBehaviorSessionId() {
    var key = "studyhub_session_id";
    if (!canUseStorage("sessionStorage")) return generateSessionId();
    var existing = window.sessionStorage.getItem(key);
    if (existing) return existing;
    var next = generateSessionId();
    window.sessionStorage.setItem(key, next);
    return next;
  }

  function getCustomerType() {
    var key = "studyhub_has_visited";
    if (!canUseStorage("localStorage")) return "New";
    var exists = window.localStorage.getItem(key);
    if (exists) return "Returning";
    window.localStorage.setItem(key, "1");
    return "New";
  }

  function getDeviceType() {
    var ua = (navigator.userAgent || "").toLowerCase();
    if (/ipad|tablet/.test(ua)) return "Tablet";
    if (/mobi|android|iphone|ipod/.test(ua)) return "Mobile";
    return "Desktop";
  }

  function getChannel() {
    try {
      var params = new URLSearchParams(window.location.search || "");
      var utmMedium = params.get("utm_medium");
      var utmSource = params.get("utm_source");
      if (utmMedium) return utmMedium;
      if (utmSource) return utmSource;
    } catch (error) {
      // ignore
    }
    return "Other";
  }

  function queueBehavior(payload) {
    window.__behaviorQueue = window.__behaviorQueue || [];
    window.__behaviorQueue.push(payload);
  }

  async function sendBehavior(payload) {
    try {
      var client = typeof window.getSupabaseClient === "function"
        ? window.getSupabaseClient()
        : window.supabaseClient;
      if (!client) {
        queueBehavior(payload);
        return;
      }
      var response = await client.from("behavior_tracking").insert([payload]);
      if (response && response.error) {
        console.warn("[Analytics] Behavior insert failed:", response.error.message);
      }
    } catch (error) {
      console.warn("[Analytics] Behavior insert error:", error);
    }
  }

  function logBehavior(activity) {
    var payload = {
      session_id: getBehaviorSessionId(),
      activity: activity || "Truy cap Trang",
      timestamp: formatVietnamTimestamp(new Date()),
      channel: getChannel(),
      location: "Online",
      device: getDeviceType(),
      customer_type: getCustomerType()
    };
    sendBehavior(payload);
  }

  function formatVietnamTimestamp(date) {
    var targetDate = date instanceof Date ? date : new Date();
    var formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });

    var parts = formatter.formatToParts(targetDate);
    var lookup = {};
    parts.forEach(function (part) {
      if (part.type !== "literal") {
        lookup[part.type] = part.value;
      }
    });

    var ms = String(targetDate.getMilliseconds()).padStart(3, "0");
    return lookup.year + "-" + lookup.month + "-" + lookup.day + "T" +
      lookup.hour + ":" + lookup.minute + ":" + lookup.second + "." + ms + "+07:00";
  }

  function mapActivityFromPath(pathname) {
    var path = String(pathname || "").toLowerCase();
    if (!path || path === "/" || path.endsWith("/index.html")) return "Truy cập trang chủ";
    if (path.indexOf("/cart.html") >= 0) return "Xem giỏ hàng";
    if (path.indexOf("/shop.html") >= 0) return "Xem cửa hàng";
    if (path.indexOf("/sproduct.html") >= 0) return "Xem chi tiết sản phẩm";
    if (path.indexOf("/orders.html") >= 0) return "Xem đơn hàng";
    if (path.indexOf("/payment.html") >= 0) return "Thanh toán";
    if (path.indexOf("/blog.html") >= 0) return "Xem bài viết";
    if (path.indexOf("/about.html") >= 0) return "Xem giới thiệu";
    if (path.indexOf("/contact.html") >= 0) return "Xem liên hệ";
    if (path.indexOf("/login.html") >= 0) return "Mở trang đăng nhập";
    if (path.indexOf("/register.html") >= 0) return "Mở trang đăng ký";
    return "Truy cập trang";
  }

  function shouldLogPageView(pathname) {
    var key = "studyhub_last_pageview_" + String(pathname || "");
    if (!canUseStorage("sessionStorage")) return true;
    var last = Number(window.sessionStorage.getItem(key) || 0);
    var now = Date.now();
    if (now - last < 15000) return false;
    window.sessionStorage.setItem(key, String(now));
    return true;
  }

  function setPendingNav(pathname) {
    if (!canUseStorage("sessionStorage")) return;
    var payload = {
      path: String(pathname || ""),
      ts: Date.now()
    };
    window.sessionStorage.setItem("studyhub_pending_nav", JSON.stringify(payload));
  }

  function consumePendingNav(pathname) {
    if (!canUseStorage("sessionStorage")) return false;
    var raw = window.sessionStorage.getItem("studyhub_pending_nav");
    if (!raw) return false;
    window.sessionStorage.removeItem("studyhub_pending_nav");
    try {
      var payload = JSON.parse(raw);
      if (!payload || !payload.path) return false;
      if (String(payload.path) !== String(pathname || "")) return false;
      return Date.now() - Number(payload.ts || 0) < 5000;
    } catch (error) {
      return false;
    }
  }

  window.flushBehaviorQueue = async function () {
    var queue = window.__behaviorQueue || [];
    if (!queue.length) return;
    window.__behaviorQueue = [];
    for (var i = 0; i < queue.length; i += 1) {
      await sendBehavior(queue[i]);
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    var path = window.location.pathname;
    if (consumePendingNav(path)) {
      return;
    }
    if (shouldLogPageView(path)) {
      logBehavior(mapActivityFromPath(path));
    }
  });

  window.trackGaEvent = trackEvent;

  window.analyticsTracker = {
    trackEvent: trackEvent,
    toGaItem: toGaItem,
    toGaItems: toGaItems,

    trackSignUp: function (method) {
      trackEvent("sign_up", {
        method: method || "email"
      });
    },

    trackLogin: function (method) {
      trackEvent("login", {
        method: method || "email"
      });
    },

    trackViewItem: function (product, listName) {
      var item = toGaItem(product);
      if (!item) return;
      trackEvent("view_item", {
        currency: "VND",
        value: item.price,
        item_list_name: listName || "product_detail",
        items: [item]
      });
    },

    trackSelectItem: function (product, listName, index) {
      var item = toGaItem(product);
      if (!item) return;
      if (index != null) {
        item.index = normalizeNumber(index, 0);
      }
      trackEvent("select_item", {
        item_list_name: listName || "product_list",
        items: [item]
      });
    },

    trackViewItemList: function (products, listName) {
      var items = toGaItems(products);
      if (!items.length) return;
      trackEvent("view_item_list", {
        item_list_name: listName || "product_list",
        items: items
      });
    },

    trackAddToCart: function (product, quantity, source) {
      var item = toGaItem(product, quantity);
      if (!item) return;
      trackEvent("add_to_cart", {
        currency: "VND",
        value: normalizePrice(item.price) * normalizeNumber(item.quantity, 1),
        source: source || "unknown",
        items: [item]
      });
      logBehavior("Thêm vào giỏ hàng");
    },

    trackRemoveFromCart: function (product, quantity, source) {
      var item = toGaItem(product, quantity);
      if (!item) return;
      trackEvent("remove_from_cart", {
        currency: "VND",
        value: normalizePrice(item.price) * normalizeNumber(item.quantity, 1),
        source: source || "unknown",
        items: [item]
      });
      logBehavior("Xóa khỏi giỏ hàng");
    },

    trackViewCart: function (items) {
      var gaItems = toGaItems(items);
      trackEvent("view_cart", {
        currency: "VND",
        value: computeValue(gaItems),
        items: gaItems
      });
      logBehavior("Xem giỏ hàng");
    },

    trackBeginCheckout: function (items) {
      var gaItems = toGaItems(items);
      trackEvent("begin_checkout", {
        currency: "VND",
        value: computeValue(gaItems),
        items: gaItems
      });
      logBehavior("Bắt đầu thanh toán");
    },

    trackAddPaymentInfo: function (items, paymentType) {
      var gaItems = toGaItems(items);
      trackEvent("add_payment_info", {
        currency: "VND",
        value: computeValue(gaItems),
        payment_type: paymentType || "cod",
        items: gaItems
      });
      logBehavior("Chọn phương thức thanh toán");
    },

    trackPurchase: function (order, items) {
      var gaItems = toGaItems(items);
      var total = normalizePrice(order && order.total_amount);
      var transactionId = String((order && (order.order_number || order.id)) || "");

      if (transactionId && hasTrackedPurchase(transactionId)) {
        console.info("[Analytics] Skip duplicate purchase event for transaction:", transactionId);
        return;
      }

      trackEvent("purchase", {
        transaction_id: transactionId || "unknown",
        value: total || computeValue(gaItems),
        currency: "VND",
        payment_type: order && order.payment_method ? String(order.payment_method) : "cod",
        shipping: 0,
        tax: 0,
        items: gaItems
      });

      logBehavior("Hoàn tất đơn hàng");

      if (transactionId) {
        markTrackedPurchase(transactionId);
      }
    }
  };

  setTimeout(function () {
    trackEvent("time_on_page_30s", { seconds: 30, page_path: window.location.pathname });
  }, 30000);

  setTimeout(function () {
    trackEvent("time_on_page_60s", { seconds: 60, page_path: window.location.pathname });
  }, 60000);

  document.addEventListener("click", function (event) {
    var target = event.target && event.target.closest("a,button,[data-track-link],[onclick]");
    if (!target) return;

    var label = (target.textContent || target.getAttribute("aria-label") || target.id || "").trim().slice(0, 100);
    trackEvent("ui_click", {
      page_path: window.location.pathname,
      element_tag: target.tagName,
      element_label: label || "(empty)"
    });

    var navTarget = target.closest("a,[data-track-link],[onclick]");
    if (!navTarget) return;

    var dataHref = navTarget.getAttribute("data-track-link") || "";
    var rawHref = navTarget.tagName === "A" ? (navTarget.getAttribute("href") || "") : "";
    var onclickAttr = navTarget.getAttribute("onclick") || "";
    var onclickMatch = onclickAttr.match(/location\.href\s*=\s*['\"]([^'\"]+)['\"]/i);
    var onclickHref = onclickMatch ? onclickMatch[1] : "";

    var resolvedHref = dataHref || rawHref || onclickHref;
    var href = resolvedHref && resolvedHref !== "#" && resolvedHref.indexOf("javascript:") !== 0
      ? new URL(resolvedHref, window.location.href).pathname
      : "";
    var activity = href ? mapActivityFromPath(href) : "Click link";
    logBehavior(activity);
    if (href) {
      setPendingNav(href);
    }
  });
})();
