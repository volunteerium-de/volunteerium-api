// To capture specific object/-s in AWS-Bucket
const extractDateNumber = (url) => {
  const regex = /\/(\d+)-/; // Regex to find numbers between '/' and '-'
  const match = url.match(regex); // Match the regex with the given URL
  if (match) {
    return match[1]; // Return the first captured group
  }
  return null; // Return null if no match is found
};

const isTokenExpired = (token) => {
  return token.expiresIn < Date.now();
};

// To generate notification based on notificationType
function notificationContentGenerator(
  notificationType,
  eventTitle = "",
  badgeType = ""
) {
  switch (notificationType) {
    case "eventReminder":
      return `Don't forget! The event "${eventTitle}" starts in 1 day.`;
    case "eventUpdate":
      return `There has been an update to the event "${eventTitle}". Please check the details.`;
    case "eventJoinRequest":
      return `You have a new join request for your event "${eventTitle}". Please check the event management section to review the request.`;
    case "eventApproveParticipant":
      return `Your request to join the event "${eventTitle}" has been approved.`;
    case "eventCancellation":
      return `We regret to inform you that the event "${eventTitle}" has been cancelled.`;
    case "confirmEventParticipants":
      return `Thank you for completing the event "${eventTitle}". Your efforts are greatly appreciated! 👏 Please confirm the participation status of the attendees in the event management section.`;
    case "scoreUpdate":
      return `Congratulations! 🥳 You've earned 10 points for participating in the event "${eventTitle}".`;
    case "badgeUpdate":
      return `Awesome job! You've earned a ${badgeType.toUpperCase()} badge ${
        badgeType === "bronze"
          ? "🥉"
          : badgeType === "silver"
          ? "🥈"
          : badgeType === "gold" && "🥇"
      } for your outstanding contributions as a volunteer. Your dedication to helping others is truly commendable!`;
    case "eventFeedbackRequest":
      return `Dear Volunteer , we would love to hear your feedback on the event "${eventTitle}". Please visit the event details page to share your experience.`;
    default:
      return "";
  }
}

// Export the functions
module.exports = {
  isTokenExpired,
  extractDateNumber,
  notificationContentGenerator,
};
