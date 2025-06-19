import Instance from "../axios/Instance";

const API_EMAIL_CHANGE_INITIATE = "/api/site/email-change/initiate";
const API_EMAIL_CHANGE_VERIFY_OLD = "/api/site/email-change/verify-old-email";
const API_EMAIL_CHANGE_VERIFY_NEW = "/api/site/email-change/verify-new-email";
const API_EMAIL_CHANGE_COMPLETE = "/api/site/email-change/complete";

export const initiateEmailChange = (newEmail) => {
  return Instance.post(API_EMAIL_CHANGE_INITIATE, { newEmail: newEmail });
};

export const verifyOldEmailOtp = (otp) => {
  return Instance.post(API_EMAIL_CHANGE_VERIFY_OLD, { 
    otp: otp,
    type: "old" 
  });
};

export const verifyNewEmailOtp = (otp) => {
  return Instance.post(API_EMAIL_CHANGE_VERIFY_NEW, { 
    otp: otp,
    type: "new" 
  });
};

export const completeEmailChange = () => {
  return Instance.post(API_EMAIL_CHANGE_COMPLETE);
}; 