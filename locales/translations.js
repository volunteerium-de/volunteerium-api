"use strict";

const translations = {
  welcome: {
    message: "welcome",
  },
  notFound: {
    route: "not-found-route",
  },

  auth: {
    googleSuccess: "auth-success",
    googleFailed: "auth-failed",
    googlePassword: "auth-password",
    register: {
      success: "register-success",
      emailExist: "register-email-exist",
    },
    login: {
      success: "login-success",
      noUser: "login-no-user",
      suspended: "login-suspended",
      notVerified: "login-not-verified",
      wrongData: "login-wrong-data",
      noEmail: "login-no-email",
    },
    verifyEmail: {
      success: "verify-email-200",
      noAccount: "verify-email-no-account",
      verified: "verify-email-verified",
      invalid: "verify-email-invalid",
    },
    verifyReCAPTCHA: {
      success: "verify-recaptcha-success",
      failed: "verify-recaptcha-failed",
      missing: "verify-recaptcha-missing",
      server: "verify-recaptcha-server",
    },
    forgot: {
      noAccount: "forgot-no-account",
      success: "forgot-200",
    },
    refresh: {
      noToken: "refresh-no-token-401",
      tokenExpired: "refresh-token-expired-401",
      noData: "refresh-no-data-404",
      wrongData: "refresh-wrong-data-401",
      unverifiedUser: "refresh-unverified-user-401",
    },
    verifyReset: {
      success: "verify-reset-200",
      missingData: "verify-reset-missing-data",
      expiredToken: "verify-reset-expired-token",
      expiredCode: "verify-reset-expired-code",
    },
    reset: {
      expiredToken: "reset-expired-token",
      invalid: "reset-invalid",
      missingData: "reset-missing-data",
      wrongEmail: "reset-wrong-email",
      notFoundAccount: "reset-not-found-account",
      success: "reset-200",
    },
    logout: {
      success: "logout-200",
      failed: "logout-400",
      noAuthHeader: "logout-401",
    },
  },

  subscription: {
    success: "subscription-success",
    failed: "subscription-failed",
    emailExists: "subscription-emailExists",
  },

  unsubscription: {
    success: "unsubscription-success",
    failed: "unsubscription-failed",
    emailNotExists: "unsubscription-emailNotExists",
  },

  address: {
    create: "address-create-201",
    update: "address-update-202",
    delete: "address-delete-204",
    notFound: "address-404",
  },
  contact: {
    create: {
      failed: "contact-create-400",
      success: "contact-create-201",
    },
    notFound: "contact-404",
  },
  conversation: {
    create: "conversation-create-201",
    delete: "conversation-delete-204",
  },
  document: {
    create: "document-create-201",
    update: "document-update-202",
    delete: "document-delete-204",
    notFound: "document-404",
  },
  event: {
    listParticipatedEvents: "event-listParticipatedEvents-404",
    create: "event-create-201",
    update: "event-update-202",
    delete: "event-delete-204",
    notFound: "event-404",
    address: "event-address",
    interestMin: "event-interest-min",
    interestMax: "event-interest-max",
  },
  eventFeedback: {
    create: "eventFeedback-create-201",
    notFound: "eventFeedback-404",
    update: "eventFeedback-update-202",
    already: "eventFeedback-already",
  },
  eventParticipant: {
    join: {
      success: "eventParticipant-join-200",
      wrong: "eventParticipant-join-wrong",
      already: "eventParticipant-join-already",
    },
    approve: {
      success: "eventParticipant-approve-200",
      already: "eventParticipant-approve-already",
    },
    noApprove: "eventParticipant-no-approve",
    noUserDetails: "eventParticipant-no-userDetails",
    conversationNotFound: "eventParticipant-conversation-404",
    reject: {
      success: "eventParticipant-reject-200",
      wrong: "eventParticipant-reject-wrong",
      already: "eventParticipant-reject-already",
    },
    confirmAttendance: {
      success: "eventParticipant-confirmAttendance-200",
    },
    confirmAbsence: {
      success: "eventParticipant-confirmAbsence-200",
    },
    notFound: "eventParticipant-404",
    delete: "eventParticipant-delete-200",
    eventNotFound: "eventParticipant-event-404",
    userNotFound: "eventParticipant-user-404",
  },
  eventReport: {
    create: "eventReport-create-201",
    failed: "eventReport-400",
    notFound: "eventReport-404",
  },
  interest: {
    create: "interest-create-201",
    notFound: "interest-404",
    update: "interest-update-202",
    delete: "interest-delete-204",
  },
  message: {
    notFound: "message-404",
    create: "message-create-201",
    delete: "message-delete-204",
  },
  notification: {
    markAllAsRead: "notification-markAllAsRead-200",
    create: "notification-create-201",
    notFound: "notification-404",
    delete: "notification-delete-204",
    update: "notification-update-202",
  },
  token: {
    notFound: "token-404",
  },
  user: {
    update: "user-update-202",
    updatePassword: {
      missing: "user-update-password-400",
      incorrect: "user-update-password-401",
    },
    delete: "user-delete-204",
    notFound: "user-404",
    userType: {
      enum: "user-userType-enum",
      required: "user-userType-required",
    },
    fullNameIndividual: "user-fullName-individual",
    organizationNameOrganization: "user-organizationName-organization",
  },
  userDetails: {
    update: "userDetails-update-202",
    notFound: "userDetails-404",
    userIdMissing: "userDetails-userId-missing",
    userNotFound: "userDetails-user-404",
    organization: {
      desc: "userDetails-organization-desc",
      logo: "userDetails-organization-logo",
      addressId: "userDetails-organization-addressId",
    },
  },
  permission: {
    isLogin: "permission-isLogin",
    isActive: "permission-isActive",
    checkEmailVerification: "permission-checkEmailVerification",
    isAdmin: "permission-isAdmin",
    isIndividualUser: "permission-isIndividualUser",
    isOrganization: "permission-isOrganization",
    isOrganizationOrAdmin: "permission-isOrganizationOrAdmin",
    isUserOwnerOrAdmin: "permission-isUserOwnerOrAdmin",
    isUserDetailsOwnerOrAdmin: "permission-isUserDetailsOwnerOrAdmin",
    checkAdminUserType: "permission-checkAdminUserType",
    isActiveEvent: "permission-isActiveEvent",
    canCreateEvent: "permission-canCreateEvent",
    isEventOwnerOrAdmin: "permission-isEventOwnerOrAdmin",
    canGiveFeedback: {
      individual: "permission-canGiveFeedback-individual",
      notAllowed: "permission-canGiveFeedback",
    },
    isFeedbackOwnerOrAdmin: "permission-isFeedbackOwnerOrAdmin",
    isDocumentOwnerOrAdmin: "permission-isDocumentOwnerOrAdmin",
    canSendMessage: {
      failed: "permission-canSendMessage-404",
      notAllowed: "permission-canSendMessage",
    },
    isMessageOwnerOrAdmin: "permission-isMessageOwnerOrAdmin",
    canConversationOwner: {
      relatedParticipant: "permission-canConversationOwner-relatedParticipant",
      participant: "permission-canConversationOwner-participant",
    },
    isConversationOwnerOrAdmin: "permission-isConversationOwnerOrAdmin",
    canConversationParticipant: {
      participant: "permission-canConversationParticipant-participant",
    },
    isConversationParticipant: "permission-isConversationParticipant",
    addressOwnerOrAdmin: "permission-addressOwnerOrAdmin",
    checkMaxParticipant: {
      maxReached: "permission-checkMaxParticipant-403",
    },
    canJoinEvent: {
      eventActive: "permission-canJoinEvent-event-active",
      eventDone: "permission-canJoinEvent-event-done",
      eventOwner: "permission-canJoinEvent-eventOwner",
      notApproved: "permission-canJoinEvent-notApprove",
      alreadyJoined: "permission-canJoinEvent-already",
    },
    canManageParticipants: "permission-canManageParticipants",
  },
  awsS3Upload: {
    typeError: "awsS3Upload-type-error-400",
    single: {
      failed: "awsS3Upload-single-500",
      userType: "awsS3Upload-single-userType",
    },
    upload: "awsS3Upload-upload",
    array: {
      failed: "awsS3Upload-array-500",
    },
  },
  queryHandler: {
    startDate: "queryHandler-startDate",
    endDate: "queryHandler-endDate",
    category: "queryHandler-category",
    global: "queryHandler-global",
    title: "queryHandler-title",
    location: "queryHandler-location",
    sort: "queryHandler-sort",
  },
  idValidation: "id-validation",
  sendEmail: {
    fail: "sendEmail-fail",
    contact: "sendEmail-contact",
  },
  limiter: {
    general: "limiter-general",
    email: "limiter-email",
  },
  yup: {
    required: {
      email: "yup-required-email",
      password: "yup-required-password",
      userType: "yup-required-userType",
      createdBy: "yup-required-createdBy",
      title: "yup-required-title",
      description: "yup-required-description",
      startDate: "yup-required-startDate",
      endDate: "yup-required-endDate",
      maxParticipant: "yup-required-maxParticipant",
    },
    minLength: {
      fullName: "yup-minLength-fullName",
      organizatioName: "yup-minLength-organizatioName",
      password: "yup-minLength-password",
      interestIds: "yup-minLength-interestIds",
      endDate: "yup-minLength-endDate",
      maxParticipant: "yup-minLength-maxParticipant",
      totalPoint: "yup-minLength-totalPoint",
    },
    maxLength: {
      fullName: "yup-maxLength-fullName",
      organizatioName: "yup-maxLength-organizatioName",
      password: "yup-maxLength-password",
      eventInterestIds: "yup-maxLength-eventInterestIds",
      userInterestIds: "yup-maxLength-userInterestIds",
    },
    email: "yup-email",
    phone: "yup-phone",
    country: "yup-country",
    language: "yup-language",
    interest: "yup-interest",
    url: "yup-url",
    address: "yup-address",
    isMongoId: "yup-isMongoId",
    validCountryCode: "yup-validCountryCode",
    password: {
      number: "yup-password-number",
      lowercase: "yup-password-lowercase",
      uppercase: "yup-password-uppercase",
      specialChar: "yup-password-specialChar",
    },
    oneOf: {
      userType: "yup-oneOf-userType",
      gender: "yup-oneOf-gender",
      ageRange: "yup-oneOf-ageRange",
    },
  },
};

module.exports = translations;
