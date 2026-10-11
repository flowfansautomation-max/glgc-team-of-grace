/* Data layer for Team of Grace. Rows keyed by week (Sunday) and leader; latest value wins. */
window.TG = (function () {
  var CFG = window.TG_CONFIG, LEADERS = window.LEADERS;
  var ITEMS = ['prayer_att','prayer_off','prayer_names','outreach_att','outreach_souls','outreach_off','rehearsal_venue','rehearsal_att','rehearsal_off','sunday_church','photo_prayer','photo_outreach','photo_rehearsal'];
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function parseDate(v) {
    if (v == null || v === '') return null; if (v instanceof Date) return v;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v)); if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    m = /^Date\((\d+),(\d+),(\d+)/.exec(String(v)); if (m) return new Date(+m[1], +m[2], +m[3]);
    var d = new Date(v); return isNaN(d.getTime()) ? null : d;
  }
  function sundayOnOrAfter(d) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + (7 - x.getDay()) % 7); return x; }
  function label(d) { return d.getDate() + ' ' + MON[d.getMonth()]; }
  function isoWeek(d) { var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); return Math.ceil(((t - new Date(Date.UTC(t.getUTCFullYear(), 0, 1))) / 86400000 + 1) / 7); }
  function num(v) { if (v == null || v === '') return null; var n = parseFloat(String(v).replace(/[^0-9.\-]/g, '')); return isNaN(n) ? null : n; }
  function alias(name) { var s = String(name || '').toLowerCase().replace(/^lp\.?\s*/, '').replace(/[^a-z]/g, '');
    for (var i = 0; i < LEADERS.length; i++) { var L = LEADERS[i];
      if (L.leader.toLowerCase().replace(/^lp\s*/, '').replace(/[^a-z]/g, '') === s || L.full.toLowerCase().replace(/[^a-z]/g, '').indexOf(s) === 0) return L.leader; }
    return null; }

  function manualRows() { var rows = [];
    (window.MANUAL_REPORTS || []).forEach(function (r) { ITEMS.forEach(function (it) { if (r[it] !== undefined && r[it] !== null) rows.push({ week: parseDate(r.week), leader: r.leader, item: it, value: r[it] }); }); });
    return rows; }
  function fetchSheet() {
    return new Promise(function (resolve, reject) {
      var cb = '__tgcb' + Date.now();
      window[cb] = function (resp) { delete window[cb];
        if (!resp || resp.status === 'error') return reject(new Error('Could not read the sheet'));
        var Lb = resp.table.cols.map(function (c) { return String(c.label || '').toLowerCase(); });
        function ix(w) { for (var i = 0; i < Lb.length; i++) if (Lb[i].indexOf(w) !== -1) return i; return -1; }
        var iW = ix('week'), iL = ix('leader'), iI = ix('item'), iV = ix('value');
        resolve(resp.table.rows.map(function (r) { var c = r.c || []; function v(i) { return i >= 0 && c[i] ? c[i].v : null; }
          return { week: parseDate(v(iW)), leader: alias(v(iL)), item: String(v(iI) || '').trim(), value: v(iV) }; }).filter(function (r) { return r.week && r.leader; })); };
      var s = document.createElement('script');
      s.src = 'https://docs.google.com/spreadsheets/d/' + CFG.SHEET_ID + '/gviz/tq?sheet=' + encodeURIComponent(CFG.TAB) + '&headers=1&tqx=out:json;responseHandler:' + cb;
      s.onerror = function () { reject(new Error('Could not reach the sheet')); }; document.body.appendChild(s);
    });
  }
  function build(rows) {
    var weeks = {}, data = {};
    rows.forEach(function (r) { if (!r.week || !r.leader) return;
      var sun = sundayOnOrAfter(r.week), k = sun.getTime(); weeks[k] = sun;
      var d = data[r.leader] || (data[r.leader] = {}), w = d[k] || (d[k] = {});
      w[r.item] = /_(att|off|souls|church)$/.test(r.item) ? num(r.value) : r.value; });
    var W = Object.keys(weeks).map(Number).sort(function (a, b) { return a - b; }).map(function (k) { return { key: k, date: weeks[k], wk: isoWeek(weeks[k]), label: label(weeks[k]) }; });
    function get(leader, k, item) { var d = data[leader] && data[leader][k]; return d && d[item] != null ? d[item] : null; }
    function reported(leader, k) { var d = data[leader] && data[leader][k]; return !!(d && Object.keys(d).length); }
    function team(L) { var n = 0; L.shepherds.forEach(function (s) { n += 1 + s.members.length; }); return n; }
    function total(k, item) { var t = 0; LEADERS.forEach(function (L) { var v = get(L.leader, k, item); if (typeof v === 'number') t += v; }); return t; }
    return { weeks: W, leaders: LEADERS, get: get, reported: reported, team: team, total: total };
  }
  function load(cb, onErr) {
    var man = manualRows();
    if (!CFG.SHEET_ID) return cb(build(man));
    fetchSheet().then(function (rows) { cb(build(man.concat(rows))); }).catch(onErr || function () {});
  }
  return { load: load };
})();
