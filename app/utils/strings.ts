interface Strings {
  common: {
    loading: string;
    loadingResults: string;
    loadingFiles: string;
  };
  errors: {
    generic: string;
    invalidCsv: string;
    unexpected: string;
    unexpectedWithDetail: string;
    serverStatus: string;
    failedToLoad: string;
    failedToLoadResults: string;
    authCheckError: string;
    loginError: string;
    accessCodeError: string;
    logoutError: string;
    authRequiredError: string;
    pleaseSelectFile: string;
    pleaseFillAccessCode: string;
    downloadFailed: string;
    downloadApiError: string;
    matchingServerError: string;
    retryTOTP: string;
    retryAccessCode: string;
    invalidAccessCode: string;
  };
  success: {
    uploadComplete: string;
    downloadComplete: string;
    matchingComplete: string;
    matchingCompleteAll: string;
  };
  processing: {
    title: string;
    downloadingFile: string;
    matchingInProgress: string;
    uploading: string;
    verifying: string;
    confirmingAccessCode: string;
    generatingResults: string;
  };
  status: {
    noResults: string;
    noFiles: string;
    downloadCompleteStatus: string;
    completed: string;
    downloadsComplete: string;
    matchesComplete: string;
  };
  instructions: {
    provideVoterFile: string;
    matchingInstructions: string;
    resultsAvailable: string;
    confirmDownloadComplete: string;
    welcomeMessage: string;
    checkEmailForAccessCode: string;
  };
  confirmations: {
    readyToMatch: string;
    completionTooltip: string;
  };
  labels: {
    username: string;
    oneTimePassword: string;
    accessCode: string;
    selectDataType: string;
    voterFile: string;
    external: string;
    outputFile: string;
    checklistItem: string;
  };
  buttons: {
    login: string;
    continue: string;
    back: string;
    submitFile: string;
    finishedUploading: string;
    downloadResults: string;
    downloadAgain: string;
    beginMatching: string;
    viewResults: string;
    yes: string;
    no: string;
  };
  popupTitles: {
    downloadComplete: string;
    downloadError: string;
    matchingComplete: string;
    serverError: string;
    processing: string;
  };
  placeholders: {
    username: string;
    password: string;
    accessCode: string;
  };
}

export function formatString(template: string, params: Record<string, string | number>): string {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`{${key}}`, String(value));
  }
  return result;
}

export const strings: Strings = {
  common: {
    loading: "Loading...",
    loadingResults: "Loading results...",
    loadingFiles: "Loading files...",
  },
  errors: {
    generic: "An error occurred. Please try again.",
    invalidCsv: "Invalid CSV format: Missing required columns: ",
    unexpected: "An unexpected error occurred",
    unexpectedWithDetail: "An unexpected error occurred: {error}",
    serverStatus: "Server responded with status {status}",
    failedToLoad: "Failed to load files. Please try again later.",
    failedToLoadResults: "Failed to load results. Please try again later.",
    authCheckError: "Auth check error",
    loginError: "Login error",
    accessCodeError: "Access code verification error",
    logoutError: "Logout error",
    authRequiredError: "useAuth must be used within an AuthProvider",
    pleaseSelectFile: "Please select a file to upload",
    pleaseFillAccessCode: "Please fill in access code",
    downloadFailed: "Failed to download file. Please try again.",
    downloadApiError: "Download API request failed",
    matchingServerError: "There was an error with the matching process. Try again in a few moments...",
    retryTOTP: "Retry TOTP TBD",
    retryAccessCode: "Retry access code TBD",
    invalidAccessCode: "Invalid access code. Please try again.",
  },
  success: {
    uploadComplete: "Upload Complete.",
    downloadComplete: "The file has been successfully downloaded.",
    matchingComplete: "The matching process has completed successfully.",
    matchingCompleteAll: "List Matching is complete. Please Continue to obtain the complete list match output data.",
  },
  processing: {
    title: "Processing",
    downloadingFile: "Downloading file...",
    matchingInProgress: "Matching files in progress...",
    uploading: "Uploading...",
    verifying: "Verifying...",
    confirmingAccessCode: "Confirming Access Code...",
    generatingResults: "Generating results file for download...",
  },
  status: {
    noResults: "No results are available for download.",
    noFiles: "No files have been uploaded yet.",
    downloadCompleteStatus: "Download Complete",
    completed: "Completed",
    downloadsComplete: "{count} of {total} Results Downloaded",
    matchesComplete: "{count} of {total} Matches Complete",
  },
  instructions: {
    provideVoterFile: "Please provide a current {fileType} file for Fallaron.",
    matchingInstructions: "You have uploaded {count} files for matching with the voter list. For each one, please click \"Begin Matching\". After matching is complete, you will see some high level match information. After you have performed all the matching, you can continue to download the full matching data output files.",
    resultsAvailable: "The following results files are available for download:",
    confirmDownloadComplete: "Please confirm that you have downloaded all results files. Click back to return to the results download screen, or confirm to continue the clean up and exit this PairWise session.",
    welcomeMessage: "Welcome to PairWise. To get started, please follow this checklist to ensure that you are ready to perform PairWise list matching.",
    checkEmailForAccessCode: "Check email for access code TBD",
  },
  confirmations: {
    readyToMatch: "Are you ready to begin matching?",
    completionTooltip: "Please complete all list matches in order to continue",
  },
  labels: {
    username: "Username:",
    oneTimePassword: "One Time Password:",
    accessCode: "Access Code",
    selectDataType: "Select Data Type",
    voterFile: "Voter File: ",
    external: "External ({type}): ",
    outputFile: "Output File: {fileName}",
    checklistItem: "Checklist TBD",
  },
  buttons: {
    login: "Login",
    continue: "Continue",
    back: "Back",
    submitFile: "Submit File",
    finishedUploading: "Finished Uploading External Files",
    downloadResults: "Download Results",
    downloadAgain: "Download Again",
    beginMatching: "Begin Matching",
    viewResults: "View Results",
    yes: "Yes",
    no: "No",
  },
  popupTitles: {
    downloadComplete: "Download Complete",
    downloadError: "Download Error",
    matchingComplete: "Matching Complete",
    serverError: "Server Error",
    processing: "Processing",
  },
  placeholders: {
    username: "Enter your username",
    password: "Enter your password",
    accessCode: "Enter access code",
  },
};
