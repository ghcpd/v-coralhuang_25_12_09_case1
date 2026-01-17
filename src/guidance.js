// Map model labels to local disposal guidance
// For a more realistic app this should be localized and configurable.
const guidanceMap = {
  plastic: { recyclable: true, bin: 'Blue (Recycle)', note: 'Rinse and flatten where possible' },
  paper: { recyclable: true, bin: 'Blue (Recycle)', note: 'Remove food, fold flat' },
  cardboard: { recyclable: true, bin: 'Blue (Recycle)', note: 'Break down boxes' },
  glass: { recyclable: true, bin: 'Green (Glass)', note: 'Remove lids, rinse' },
  metal: { recyclable: true, bin: 'Blue (Recycle)', note: 'Empty and rinse' },
  trash: { recyclable: false, bin: 'Black (Landfill)', note: 'Not recyclable in many curbside programs' },
  organic: { recyclable: false, bin: 'Brown (Compost)', note: 'Food scraps, yard waste' },
  other: { recyclable: false, bin: 'Black (Landfill)', note: 'Special disposal may be required' }
};

function getGuidance(label) {
  if (!label) return guidanceMap.other;
  const key = String(label).toLowerCase();
  return guidanceMap[key] || guidanceMap.other;
}

module.exports = { guidanceMap, getGuidance };
