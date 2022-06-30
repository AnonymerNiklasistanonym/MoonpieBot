import { MOONPIE_STRING_ID } from "../moonpie";

export const MOONPIE_USER_STRING_ID = `${MOONPIE_STRING_ID}_USER`;

export const moonpieUserGet = {
  id: `${MOONPIE_USER_STRING_ID}_GET`,
  default:
    "@$(USER) The user %MOONPIE:USER% has %MOONPIE:COUNT% moonpie$(IF_GREATER=%MOONPIE:COUNT%>1|s) and is rank %MOONPIE:LEADERBOARD_RANK% on the leaderboard!",
};
export const moonpieUserNeverClaimed = {
  id: `${MOONPIE_USER_STRING_ID}_NEVER_CLAIMED`,
  default: "The user %MOONPIE:USER% has never claimed a moonpie!",
};
export const moonpieUserPermissionError = {
  id: `${MOONPIE_USER_STRING_ID}_PERMISSION_ERROR`,
  default:
    "You are not a broadcaster and thus are not allowed to use this command!",
};
export const moonpieUserSetNAN = {
  id: `${MOONPIE_USER_STRING_ID}_SET_NAN`,
  default:
    "The given moonpie count (%MOONPIE:SET_OPERATION%)'%MOONPIE:SET_COUNT%' is not a valid number!",
};

export const moonpieUserSet = {
  id: `${MOONPIE_USER_STRING_ID}_SET`,
  default:
    "@$(USER) You have set the number of moonpies for the user %MOONPIE:USER% to %MOONPIE:COUNT% moonpie$(IF_GREATER=%MOONPIE:COUNT%>1|s) (%MOONPIE:SET_OPERATION%%MOONPIE:SET_COUNT%) and they are now rank %MOONPIE:LEADERBOARD_RANK% on the leaderboard!",
};
export const moonpieUserDelete = {
  id: `${MOONPIE_USER_STRING_ID}_DELETE`,
  default: "@$(USER) You deleted the entry of the user %MOONPIE:USER%",
};

export const moonpieUser = [
  moonpieUserGet,
  moonpieUserNeverClaimed,
  moonpieUserPermissionError,
  moonpieUserSetNAN,
  moonpieUserSet,
  moonpieUserDelete,
];
