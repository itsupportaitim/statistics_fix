// Function to compute hourly stats for a search text in groupName (loads full JSON on each call)
async function getHourlyStatsForText(searchText) {
    try {
        const response = await fetch('logbook-reports.json');
        if (!response.ok) throw new Error('Failed to load raw data');
        const documents = await response.json();

        // Filter documents where groupName includes searchText (case-insensitive)
        const filteredDocs = documents.filter(doc => 
            doc.groupName && doc.groupName.toLowerCase().includes(searchText.toLowerCase())
        );

        if (filteredDocs.length === 0) {
            return [];
        }

        // Initialize counters with +6 hour shift
        const hourlyCounts = new Array(24).fill(0);

        filteredDocs.forEach(doc => {
            const dateStr = doc.date;
            if (dateStr) {
                const date = new Date(dateStr);
                const shiftedTimestamp = date.getTime() + (6 * 60 * 60 * 1000); // +6 hours
                const shiftedDate = new Date(shiftedTimestamp);
                const hour = shiftedDate.getUTCHours();

                if (hour >= 0 && hour < 24) {
                    hourlyCounts[hour]++;
                }
            }
        });

        // Format as array of objects
        return hourlyCounts.map((count, hour) => ({
            hour,
            label: `${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00 (UTC+6)`,
            count
        }));
    } catch (error) {
        throw new Error(`Failed to process search: ${error.message}`);
    }
}