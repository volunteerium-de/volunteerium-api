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
      return {
        en: `Don't forget! The event "${eventTitle}" starts in 1 day.`,
        de: `Nicht vergessen! Die Veranstaltung "${eventTitle}" beginnt in 1 Tag.`,
      };
    case "eventUpdate":
      return {
        en: `There has been an update to the event "${eventTitle}". Please check the details.`,
        de: `Es gibt ein Update zur Veranstaltung "${eventTitle}". Bitte prüfen Sie die Details.`,
      };
    case "eventJoinRequest":
      return {
        en: `You have a new join request for your event "${eventTitle}". Please check the event management section to review the request.`,
        de: `Sie haben eine neue Beitrittsanfrage für Ihre Veranstaltung "${eventTitle}". Bitte überprüfen Sie den Veranstaltungsbereich, um die Anfrage zu überprüfen.`,
      };
    case "eventApproveParticipant":
      return {
        en: `Your request to join the event "${eventTitle}" has been approved.`,
        de: `Ihre Anfrage, an der Veranstaltung "${eventTitle}" teilzunehmen, wurde genehmigt.`,
      };
    case "eventCancellation":
      return {
        en: `We regret to inform you that the event "${eventTitle}" has been cancelled.`,
        de: `Wir bedauern, Ihnen mitteilen zu müssen, dass die Veranstaltung "${eventTitle}" abgesagt wurde.`,
      };
    case "confirmEventParticipants":
      return {
        en: `Thank you for completing the event "${eventTitle}". Your efforts are greatly appreciated! 👏 Please confirm the participation status of the attendees in the event management section.`,
        de: `Vielen Dank, dass Sie die Veranstaltung "${eventTitle}" abgeschlossen haben. Ihre Bemühungen werden sehr geschätzt! 👏 Bitte bestätigen Sie den Teilnahme-Status der Teilnehmer im Veranstaltungsbereich.`,
      };
    case "scoreUpdate":
      return {
        en: `Congratulations! 🥳 You've earned 10 points for participating in the event "${eventTitle}".`,
        de: `Glückwunsch! 🥳 Sie haben 10 Punkte für die Teilnahme an der Veranstaltung "${eventTitle}" verdient.`,
      };
    case "badgeUpdate":
      return {
        en: `Awesome job! You've earned a ${badgeType.toUpperCase()} badge ${
          badgeType === "bronze"
            ? "🥉"
            : badgeType === "silver"
            ? "🥈"
            : badgeType === "gold" && "🥇"
        } for your outstanding contributions as a volunteer. Your dedication to helping others is truly commendable!`,
        de: `Tolle Leistung! Sie haben ein ${badgeType.toUpperCase()}-Abzeichen ${
          badgeType === "bronze"
            ? "🥉"
            : badgeType === "silver"
            ? "🥈"
            : badgeType === "gold" && "🥇"
        } für Ihre herausragenden Beiträge als Freiwilliger verdient. Ihr Engagement, anderen zu helfen, ist wirklich lobenswert!`,
      };
    case "eventFeedbackRequest":
      return {
        en: `Dear Volunteer, we would love to hear your feedback on the event "${eventTitle}". Please visit the event details page to share your experience.`,
        de: `Lieber Freiwilliger, wir würden gerne Ihr Feedback zur Veranstaltung "${eventTitle}" hören. Bitte besuchen Sie die Veranstaltungsseite, um Ihre Erfahrungen zu teilen.`,
      };
    default:
      return { en: "", de: "" };
  }
}

// Export the functions
module.exports = {
  isTokenExpired,
  extractDateNumber,
  notificationContentGenerator,
};
