
export interface sentOtpRequest {
    mobileNumber: string,
}

export interface sentOtpResponse {
    sucess: boolean,
    message: string
    otp: string
}

export interface verifyOtpRequest {
    mobileNumber: string,
    otp: string,
} 

export interface verifyOtpResponse {
    success: boolean,
    message: string,
    user: {
      id: string,
      mobileNumber: string,
      role: string,
      isMobileVerified: boolean,
      profile: {
        firstName: string,
        lastName: string,
      },
    },
    accessToken: string,
    refreshToken: string,
}


export interface registerRequest {
    mobileNumber: string,
    name: string,
}

export interface registerResponse {
    success: boolean,
    message: string,
    otp: string,
}
