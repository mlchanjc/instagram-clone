export function parseDate(dateString) {
	const date = new Date(dateString);

	let month = date.getMonth();

	switch (
		month + 1 // + 1 because getMonth is zero-based smh
	) {
		case 1:
			month = "Jan";
			break;
		case 2:
			month = "Feb";
			break;
		case 3:
			month = "Mar";
			break;
		case 4:
			month = "Apr";
			break;
		case 5:
			month = "May";
			break;
		case 6:
			month = "Jun";
			break;
		case 7:
			month = "Jul";
			break;
		case 8:
			month = "Aug";
			break;
		case 9:
			month = "Sep";
			break;
		case 10:
			month = "Oct";
			break;
		case 11:
			month = "Nov";
			break;
		case 12:
			month = "Dec";
			break;
		default:
			month = "Invalid month number";
			break;
	}

	const day = date.getDate();
	const hour = date.getHours();
	const minute = date.getMinutes();

	const period = hour >= 12 ? "pm" : "am";
	const formattedHour = hour % 12 || 12;
	const formattedMinute = minute.toString().padStart(2, "0");

	return `${month} ${day} ${formattedHour}:${formattedMinute}${period}`;
}

export function getTimePassed(date) {
	const pastTime = new Date(date);
	const currentTime = new Date();
	const timeDiff = currentTime - pastTime;

	// Calculate the time units
	const seconds = Math.floor(timeDiff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const years = Math.floor(days / 365);

	// Construct the time passed string
	let timePassed = "";
	if (years > 0) {
		timePassed += `${years} year${years > 1 ? "s" : ""} `;
	} else if (days > 0) {
		timePassed += `${days} day${days > 1 ? "s" : ""} `;
	} else if (hours > 0) {
		timePassed += `${hours % 24} hour${hours % 24 > 1 ? "s" : ""} `;
	} else if (minutes > 0) {
		timePassed += `${minutes % 60} minute${minutes % 60 > 1 ? "s" : ""} `;
	} else if (seconds > 0) {
		timePassed += `${seconds % 60} second${seconds % 60 > 1 ? "s" : ""} `;
	} else {
		timePassed = "Just now";
	}

	return timePassed.trim();
}
