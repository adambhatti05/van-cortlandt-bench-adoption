export type PublicAdoption = {
  benchId: number;
  donorName: string;
  dedication: string;
  termYears: number;
  termMonths: number;
  status: string;
  adoptedUntil: string;
  prototypeInventory?: boolean;
};

const TARGET_ADOPTED = 200;
const TARGET_PENDING = 6;

const donorNames = [
  "The Sullivan Family",
  "The Morales Family",
  "The Bennett Family",
  "The Kim Family",
  "The Patel Family",
  "The Thompson Family",
  "The Rivera Family",
  "The Brooks Family",
  "The Nguyen Family",
  "The Foster Family",
  "The Martinez Family",
  "The Reynolds Family",
  "The Shah Family",
  "The Murphy Family",
  "The Green Family",
  "The Robinson Family",
  "The Park Family",
  "The Edwards Family",
  "The Torres Family",
  "The Collins Family",
  "The Wright Family",
  "The Cooper Family",
  "The Flores Family",
  "The Bell Family",
  "The Ortiz Family",
  "The Hughes Family",
  "The Sanders Family",
  "The Price Family",
  "The Ross Family",
  "The Ward Family",
  "Friends of Van Cortlandt",
  "The North Bronx Walking Club",
  "The Lakeview Garden Circle",
  "The Putnam Trail Runners",
  "The Mosholu Neighbors",
  "The Bronx Birding Society",
  "The Van Cortlandt Volunteers",
  "The Woodland Community Group",
  "The Parade Ground Friends",
  "The Tibbetts Brook Association",
];

const dedications = [
  "In loving memory of a life beautifully lived.",
  "May everyone who rests here find peace.",
  "For countless walks, talks, and happy memories.",
  "A quiet place to remember and reflect.",
  "Celebrating family, friendship, and the beauty of the park.",
  "Forever remembered beneath the trees.",
  "For those who made every day brighter.",
  "In gratitude for the community we call home.",
  "May this view bring joy for generations.",
  "A place to pause and appreciate the journey.",
  "In honor of a generous heart and adventurous spirit.",
  "For Sunday strolls and stories shared together.",
  "Dedicated with love to all who enjoy this park.",
  "Where memories grow and friendships endure.",
  "In celebration of many wonderful years together.",
  "For the walkers, runners, dreamers, and neighbors.",
  "Always in our hearts and forever part of this park.",
  "A lasting place for rest, reflection, and renewal.",
  "In memory of someone who loved the outdoors.",
  "With gratitude for every season spent here.",
  "For morning light, birdsong, and peaceful afternoons.",
  "In honor of the people who bring our community together.",
  "May laughter and kindness always surround this place.",
  "Remembered with love beside these familiar paths.",
  "For all the moments that became treasured memories.",
  "A small place of rest in a park full of wonder.",
  "In celebration of a life devoted to family and friends.",
  "May the beauty of nature keep this memory alive.",
  "For every journey that begins along these paths.",
  "Given with love to the people of the Bronx.",
];

function fictionalDetails(benchId: number) {
  return {
    donorName: donorNames[(benchId * 7) % donorNames.length],
    dedication: dedications[(benchId * 11) % dedications.length],
  };
}

export function addSampleInventory(records: PublicAdoption[]) {
  const completed = [...records];
  const used = new Set(records.map((record) => record.benchId));
  let adopted = records.filter((record) => record.status === "approved").length;
  let pending = records.filter((record) => record.status === "pending").length;

  for (
    let benchId = 1;
    benchId <= 500 && adopted < TARGET_ADOPTED;
    benchId += 1
  ) {
    if (used.has(benchId)) continue;
    const details = fictionalDetails(benchId);
    completed.push({
      benchId,
      ...details,
      termYears: 5,
      termMonths: 0,
      status: "approved",
      adoptedUntil: `203${benchId % 7}-12-31`,
      prototypeInventory: true,
    });
    used.add(benchId);
    adopted += 1;
  }

  for (
    let benchId = 1;
    benchId <= 500 && pending < TARGET_PENDING;
    benchId += 1
  ) {
    if (used.has(benchId)) continue;
    const details = fictionalDetails(benchId);
    completed.push({
      benchId,
      ...details,
      termYears: 5,
      termMonths: 0,
      status: "pending",
      adoptedUntil: `203${benchId % 7}-12-31`,
      prototypeInventory: true,
    });
    used.add(benchId);
    pending += 1;
  }

  return completed;
}
