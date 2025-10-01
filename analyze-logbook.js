const fs = require('fs').promises;
const path = require('path');

async function analyzeLogbookData() {
  try {
    // Load the exported JSON
    const dataPath = path.join(__dirname, 'logbook-reports.json');
    const rawData = await fs.readFile(dataPath, 'utf8');
    const documents = JSON.parse(rawData);
    console.log(`Loaded ${documents.length} documents`);

    // Initialize counters
    const hourlyCounts = new Array(24).fill(0); // Index 0-23 for hours
    const weeklyCounts = new Array(7).fill(0);  // Index 0=Sun, 1=Mon, ..., 6=Sat

    // Process each document with +6 hour shift for UTC+6
    documents.forEach(doc => {
      const dateStr = doc.date;
      if (dateStr) {
        const date = new Date(dateStr);
        const shiftedTimestamp = date.getTime() + (6 * 60 * 60 * 1000); // +6 hours in ms
        const shiftedDate = new Date(shiftedTimestamp);
        const hour = shiftedDate.getUTCHours(); // Now this is effectively UTC+6 hour
        const dayOfWeek = shiftedDate.getUTCDay(); // Now this is effectively UTC+6 day

        if (hour >= 0 && hour < 24) {
          hourlyCounts[hour]++;
        }
        if (dayOfWeek >= 0 && dayOfWeek < 7) {
          weeklyCounts[dayOfWeek]++;
        }
      }
    });

    // Format as arrays of objects for easy frontend use (e.g., charting)
    const hourlyData = hourlyCounts.map((count, hour) => ({
      hour,
      label: `${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00 (UTC+6)`,
      count
    }));

    const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeklyData = weeklyCounts.map((count, dayIndex) => ({
      day: dayIndex,
      label: dayLabels[dayIndex],
      count
    }));

    // Write to new JSON files
    await fs.writeFile('hourly-aggregate.json', JSON.stringify(hourlyData, null, 2));
    await fs.writeFile('weekly-aggregate.json', JSON.stringify(weeklyData, null, 2));

    console.log('Analysis complete with UTC+6 shift! Check hourly-aggregate.json and weekly-aggregate.json');
    console.log('Hourly summary:', hourlyData);
    console.log('Weekly summary:', weeklyData);
  } catch (error) {
    console.error('Error processing data:', error);
  }
}

analyzeLogbookData();