export type JobStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'INTERNSHIP';

export interface IJobPost {
  _id: string;
  title: string;
  description: string;
  companyName: string;
  employmentType: EmploymentType;
  location: {
    city: string;
    state: string;
    address?: string;
  };
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: string; // 'per month', 'per year', etc.
  };
  requirements: string[]; // Skills, qualifications, etc.
  responsibilities: string[];
  contact: {
    name: string;
    mobileNumber: string;
    email?: string;
    whatsappNumber: string;
  };
  postedBy: string; // Employer (User with BROKER or SUPER_ADMIN role)
  createdBy: string; // User who created
  updatedBy?: string; // User who last updated
  status: JobStatus;
  approvedBy?: string; // Admin who approved
  approvedAt?: Date;
  rejectionReason?: string;
  views: number;
  applicationCount: number;
  isDeleted: {
    status: boolean;
    deletedBy?: string;
    deletedAt?: Date;
  };
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface getJobsResponse {
    success: boolean;
    message: string;
    data:{
        jobs: IJobPost[];
        pagination: {
            page: number,
            limit: number,
            total: number,
            pages: number,
          },
    };
}

export interface getJobByIdResponse {
    success: boolean;
    message: string;
    data: {
        job: IJobPost;
    };
}

export interface createJobPostRequest {
  title: string;
  description: string;
  companyName: string;
  employmentType: EmploymentType;
  location: {
    city: string;
    state: string;
    address?: string;
  };
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: string; // 'per month', 'per year', etc.
  };
  requirements: string[]; // Skills, qualifications, etc.
  responsibilities: string[];
  contact: {
    name: string;
    mobileNumber: string;
    email?: string;
    whatsappNumber: string;
  };
  // The following fields are managed by the backend and are optional on the client
  postedBy?: string; // Employer (User with BROKER or SUPER_ADMIN role)
  createdBy?: string; // User who created
  updatedBy?: string; // User who last updated
  status?: JobStatus;
  approvedBy?: string; // Admin who approved
  approvedAt?: Date;
  rejectionReason?: string;
  views?: number;
  applicationCount?: number;
}

export interface createJobPostResponse {
  success: boolean;
  message: string;
  data: IJobPost;
}

export interface applyJobResponse {
  success: boolean;
  message: string;
  application: {
    id: string,
    jobPost: {
      id: string,
      title: string,
      companyName: string,
    },
    contact: {
      whatsapp: string,
      call: string,
      whatsappNumber: string,
      mobileNumber: string,
    },
  },
}

export type ApplicationStatus = 'PENDING' | 'SHORTLISTED' | 'REJECTED' | 'ACCEPTED'

export interface IJobApplication {
  _id: string
  jobPost: {
    _id: string
    title: string
    companyName?: string
  } | string
  applicant: {
    _id: string
    profile?: {
      firstName?: string
      lastName?: string
    }
    mobileNumber?: string
  } | string
  createdBy: string
  updatedBy?: string
  status: ApplicationStatus
  coverLetter?: string
  appliedAt: string
  reviewedAt?: string
  reviewedBy?: {
    _id: string
    profile?: {
      firstName?: string
      lastName?: string
    }
  } | string
  notes?: string
}

export interface GetApplicationsResponse {
  success: boolean
  message: string
  data: {
    applications: IJobApplication[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus
  notes?: string
}

export interface CreateApplicationRequest {
  id: string
  coverLetter?: string
  notes?: string
  applicantId?: string
}

// Employer access request types
export interface EmployerRequestContact {
  name: string
  mobileNumber: string
  email?: string
  whatsappNumber: string
}

export interface EmployerRequestAddress {
  street?: string
  city?: string
  state?: string
  pincode?: string
}

export interface RequestEmployerAccessRequest {
  companyName: string
  companyDescription?: string
  contact: EmployerRequestContact
  address?: EmployerRequestAddress
  documents?: string[]
}

export interface RequestEmployerAccessResponse {
  success: boolean
  message: string
}

// Option lists for UI
export const EMPLOYMENT_TYPE_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'INTERNSHIP', label: 'Internship' }
]

// Note: status is handled internally by the backend; the frontend
// does not expose status filters or controls in the UI.
