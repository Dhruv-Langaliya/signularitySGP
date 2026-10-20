export function getNormalizedRole(role) {
  if (role === null || role === undefined || role === '') return 'Student';
  const r = String(role).trim().toLowerCase();
  if (r.includes('admin') || r === '2') return 'Admin';
  if (r.includes('facul') || r.includes('teacher') || r === '1') return 'Faculty';
  return 'Student';
}

export function getBatchStatus(batch) {
  if (!batch || !batch.isActive) return 'CLOSED';
  const now = new Date();
  const start = new Date(batch.startDate);
  const end = new Date(batch.endDate);
  if (now < start) return 'UPCOMING';
  if (now > end) return 'CLOSED';
  return 'ACTIVE';
}

export function getActiveSubmissionBatch(batches) {
  return (batches || []).find(b => b.isActive) || batches?.[0] || null;
}
