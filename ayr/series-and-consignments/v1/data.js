// Deterministic, fictional prototype data. Each sample represents several records;
// only the rows needed for the current page are expanded by the UI.
const DATA = (() => {
  let seed = 20261104;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const pick = values => values[Math.floor(random() * values.length)];
  const iso = (days) => new Date(Date.UTC(2026, 9, 30) - days * 86400000).toISOString().slice(0, 10);
  const bodies = [
    ['Cabinet Office', 'CAB'], ['Home Office', 'HO'], ['Department for Transport', 'MT'],
    ['Department for Culture, Media and Sport', 'PF'], ['Land Registry', 'LR'],
    ['National Institute for Health and Care Excellence', 'JA']
  ];
  const subjects = ['Community services programme', 'Regional coordination papers', 'Public appointments review',
    'Digital correspondence programme', 'Service planning committee', 'Local resilience planning',
    'Community liaison programme', 'Regional partnership review', 'Public information programme',
    'Infrastructure planning review', 'Evidence coordination programme', 'Consultation planning review',
    'Guidance publishing programme'];
  const types = ['Minutes • Letters • Reports', 'Policy reports • Briefing notes', 'Minutes • Correspondence',
    'Consultation responses • Reports', 'Agenda papers • Briefing notes'];
  const titles = ['Programme overview and objectives', 'Steering group meeting minutes',
    'Consultation responses and analysis', 'Regional delivery progress report',
    'Correspondence about service standards', 'Options appraisal and recommendations',
    'Committee agenda and supporting papers', 'Programme review and action plan',
    'Public engagement briefing', 'Annual assessment of delivery', 'Planning workshop summary',
    'Evidence review and recommendations'];
  const series = bodies.flatMap(([body, prefix], b) => subjects.map((subject, j) => ({
    id: 's' + (b * 13 + j + 1), ref: prefix + ' ' + (9701 + j),
    title: body + ': ' + subject, subject, type: types[j % types.length], body,
    allocation: 0.2 + random() * random() * 4
  })));
  const allocationTotal = series.reduce((sum, s) => sum + s.allocation, 0);
  const consignments = [], records = [];
  for (let i = 0; i < 2673; i++) {
    let ticket = random() * allocationTotal;
    const s = i < series.length ? series[i] : series.find(s => (ticket -= s.allocation) <= 0) || series.at(-1);
    let code = '', n = i + 301;
    for (let j = 0; j < 4; j++) { code = String.fromCharCode(65 + n % 26) + code; n = Math.floor(n / 26); }
    const days = i === 0 ? 0 : Math.floor(random() * 2100);
    const c = {id: 'c' + (i + 1), ref: 'TDR-' + iso(days).slice(0, 4) + '-' + code,
      seriesId: s.id, body: s.body, transferred: iso(days)};
    consignments.push(c);
    for (let j = 0; j < 4; j++) {
      const topic = titles[(i * 3 + j) % titles.length], closed = random() < 0.23;
      records.push({id: 'r' + (records.length + 1), title: s.subject + ' – ' + topic.toLowerCase() + '.pdf',
        description: topic + ' for the ' + s.subject.toLowerCase() + '. Includes working papers, decisions and follow-up actions.',
        content: topic + '. This document concerns the ' + s.subject.toLowerCase() +
          '. The committee considered programme delivery, regional coordination, public consultation, access to services, evidence and recommendations. The programme team reviewed correspondence and agreed the next steps.',
        seriesId: s.id, consignmentId: c.id, body: s.body, modified: iso(days + 30 + Math.floor(random() * 600)),
        status: closed ? 'Closed' : 'Open', opening: closed ? '2031-01-01' : '',
        path: s.subject + ' … ' + c.transferred.slice(0, 4) + ' … ' + topic,
        language: 'English', format: 'PDF', size: (124 + Math.floor(random() * 2400)) + ' KB',
        weight: 1 + Math.floor(random() * random() * 80)});
    }
  }
  // Allocate exactly 159,847 virtual records, preserving varied local totals.
  const target = 159847, rawTotal = records.reduce((sum, r) => sum + r.weight, 0);
  let allocated = 0;
  records.forEach(r => { r.weight = Math.max(1, Math.floor(r.weight * target / rawTotal)); allocated += r.weight; });
  for (let i = 0; allocated < target; i = (i + 1) % records.length) { records[i].weight++; allocated++; }
  for (let i = records.length - 1; allocated > target; i = (i - 1 + records.length) % records.length) {
    if (records[i].weight > 1) { records[i].weight--; allocated--; }
  }
  return {series, consignments, records};
})();
