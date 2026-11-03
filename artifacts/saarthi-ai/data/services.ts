import { educationServices } from "./educationServices";
import { transportServices } from "./transportServices";

export type ServiceCategory =
  | "Identity"
  | "Education"
  | "Scholarships"
  | "Business"
  | "Social security"
  | "Farmer support"
  | "Travel"
  | "Transport"
  | "Employment"
  | "Health"
  | "Housing"
  | "Money & taxes"
  | "Jobs & skills"
  | "Government services"
  | "Citizenship"
  | "Documents"
  | "Digital Documents"
  | "Welfare"
  | "Agriculture"
  | "Grievances"
  | "Governance"
  | "Pension"
  | "Housing & utilities"
  | "Tax & Finance"
  | "Tax & Business"
  | "Citizen Services"
  | "Safety & Security"
  | "Public Grievance";
// What the official link leads to. Records without a linkType are shown as a
// general official website; only mark "application" or "forms" once verified.
export type OfficialLinkType = "information" | "application" | "forms" | "website";
export interface ServiceRecord {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  eligibility: string;
  documents: string;
  source: string;
  officialUrl: string;
  linkType?: OfficialLinkType;
  lastVerified: string;
}
export const services: ServiceRecord[] = [
  {
    id: "aadhaar-update",
    name: "Aadhaar services",
    category: "Identity",
    description:
      "Find official information for Aadhaar enrolment, updates, status checks, and related services.",
    eligibility:
      "Residents of India can use the official UIDAI services that match their request.",
    documents:
      "Requirements vary by service. Check UIDAI before visiting a centre or submitting a request.",
    source: "uidai.gov.in",
    officialUrl: "https://uidai.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },
  {
    id: "pan-card",
    name: "PAN card application",
    category: "Identity",
    description:
      "Learn how to apply for or update a Permanent Account Number through the Income Tax Department.",
    eligibility:
      "Individuals and entities that need a PAN can review the official application routes.",
    documents:
      "Identity, address, and date-of-birth proof requirements depend on the applicant and application route.",
    source: "incometax.gov.in",
    officialUrl:
      "https://www.incometax.gov.in/iec/foportal/help/how-to-apply-for-pan",
    lastVerified: "Official portal link checked August 2026",
  },
  {
    id: "pm-kisan",
    name: "PM-KISAN",
    category: "Farmer support",
    description:
      "Use the official PM-KISAN portal to review scheme information, registration guidance, and beneficiary services.",
    eligibility:
      "Eligibility is defined by the current PM-KISAN guidelines and exclusions published on the official portal.",
    documents:
      "Keep the details requested by the official portal ready. Requirements can change by case.",
    source: "pmkisan.gov.in",
    officialUrl: "https://pmkisan.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },
  {
    id: "national-scholarship",
    name: "National Scholarship Portal",
    category: "Education",
    description:
      "Explore scholarship applications and status services on the Government of India scholarship portal.",
    eligibility:
      "Each scholarship has its own eligibility, institution, income, and academic requirements.",
    documents:
      "Document requirements are listed in the individual scholarship application and should be checked before applying.",
    source: "scholarships.gov.in",
    officialUrl: "https://scholarships.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },
  {
    id: "national-social-assistance",
    name: "National Social Assistance Programme",
    category: "Social security",
    description:
      "Read official information about social assistance programmes and find the relevant government guidance.",
    eligibility:
      "Programme eligibility depends on the specific assistance category and current government rules.",
    documents:
      "The implementing authority may request identity, residence, income, or other supporting documents.",
    source: "nsap.nic.in",
    officialUrl: "https://nsap.nic.in/",
    lastVerified: "Official portal link checked August 2026",
  },
  {
    id: "udyam-registration",
    name: "Udyam Registration",
    category: "Business",
    description:
      "Access the official registration portal for micro, small, and medium enterprise registration information.",
    eligibility:
      "Businesses should review the official MSME classification and registration guidance before proceeding.",
    documents:
      "The official portal explains the information needed for registration and verification.",
    source: "udyamregistration.gov.in",
    officialUrl: "https://udyamregistration.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },

  {
    id: "passport-seva",
    name: "Passport Seva",
    category: "Travel",
    description:
      "Apply for a new passport, re-issue a passport, book appointments, and check passport application services.",
    eligibility:
      "Indian citizens can use the official Passport Seva portal for passport and related services.",
    documents:
      "Document requirements depend on the type of passport service. Check the official portal before applying.",
    source: "passportindia.gov.in",
    officialUrl: "https://www.passportindia.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },

  {
    id: "voter-services",
    name: "Voter Services",
    category: "Identity",
    description:
      "Register as a voter, correct voter information, download e-EPIC, search electoral rolls, and track applications.",
    eligibility:
      "Eligible Indian citizens can use the Election Commission of India's citizen services.",
    documents: "Requirements depend on the voter service and application type.",
    source: "voters.eci.gov.in",
    officialUrl: "https://voters.eci.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },

  {
    id: "parivahan",
    name: "Driving Licence & Vehicle Services",
    category: "Transport",
    description:
      "Access driving licence, learner licence, vehicle registration, ownership transfer, application status, and other transport services.",
    eligibility:
      "Services are available according to the applicable transport rules and requirements.",
    documents:
      "Documents depend on the driving licence or vehicle service requested.",
    source: "parivahan.gov.in",
    officialUrl: "https://parivahan.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },

  {
    id: "digilocker",
    name: "DigiLocker",
    category: "Digital Documents",
    description:
      "Access, store, share, and verify authentic digital government documents and certificates.",
    eligibility:
      "Citizens can register and use DigiLocker according to the platform's authentication requirements.",
    documents:
      "Documents available depend on the issuing authority and services connected to DigiLocker.",
    source: "digilocker.gov.in",
    officialUrl: "https://www.digilocker.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },

  {
    id: "epfo",
    name: "EPFO Services",
    category: "Employment",
    description:
      "Access Employees' Provident Fund services, UAN services, member services, pension information, and related facilities.",
    eligibility:
      "EPFO services depend on the user's membership, employment, and applicable scheme.",
    documents:
      "Requirements vary according to the EPFO service being requested.",
    source: "epfindia.gov.in",
    officialUrl: "https://www.epfindia.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },

  {
    id: "esic",
    name: "ESIC Services",
    category: "Health",
    description:
      "Access official Employees' State Insurance Corporation information and services for insured persons and employers.",
    eligibility:
      "Eligibility depends on applicable ESIC rules and insured status.",
    documents: "Requirements vary according to the ESIC service being used.",
    source: "esic.gov.in",
    officialUrl: "https://www.esic.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },

  {
    id: "e-shram",
    name: "e-Shram",
    category: "Employment",
    description:
      "Register and access services for unorganised workers through the Government of India's e-Shram portal.",
    eligibility:
      "Eligibility depends on the current e-Shram registration requirements for unorganised workers.",
    documents:
      "Aadhaar, Aadhaar-linked mobile number, and bank details may be required for registration.",
    source: "eshram.gov.in",
    officialUrl: "https://eshram.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },

  {
    id: "ayushman-bharat",
    name: "Ayushman Bharat PM-JAY",
    category: "Health",
    description:
      "Access official information and services related to the Ayushman Bharat Pradhan Mantri Jan Arogya Yojana.",
    eligibility:
      "Eligibility is determined according to the current PM-JAY rules and beneficiary database.",
    documents:
      "Requirements depend on the service and beneficiary verification process.",
    source: "pmjay.gov.in",
    officialUrl: "https://pmjay.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },

  {
    id: "income-tax",
    name: "Income Tax e-Filing",
    category: "Tax & Finance",
    description:
      "File income tax returns, access tax services, check tax information, and manage income-tax related services.",
    eligibility:
      "Tax services depend on the taxpayer's status and applicable income-tax rules.",
    documents:
      "Documents and information depend on the tax service or return being filed.",
    source: "incometax.gov.in",
    officialUrl: "https://www.incometax.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },

  {
    id: "gst-portal",
    name: "GST Portal",
    category: "Tax & Business",
    description:
      "Access GST registration, returns, payments, taxpayer services, and GST-related information.",
    eligibility:
      "GST requirements depend on the taxpayer, business activity, and applicable GST rules.",
    documents:
      "Documents and information depend on the GST service or registration process.",
    source: "gst.gov.in",
    officialUrl: "https://www.gst.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },

  {
    id: "gem",
    name: "Government e-Marketplace",
    category: "Business",
    description:
      "Access the Government of India's online marketplace for procurement of goods and services.",
    eligibility:
      "Eligibility depends on whether the user is registering as a buyer, seller, or service provider.",
    documents:
      "Registration and verification requirements depend on the account type.",
    source: "gem.gov.in",
    officialUrl: "https://gem.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },

  {
    id: "mygov",
    name: "MyGov India",
    category: "Citizen Services",
    description:
      "Participate in government initiatives, consultations, discussions, campaigns, and citizen engagement activities.",
    eligibility:
      "Citizens can participate in activities according to the requirements of individual initiatives.",
    documents:
      "Requirements vary depending on the specific MyGov activity or service.",
    source: "mygov.in",
    officialUrl: "https://www.mygov.in/",
    lastVerified: "Official portal link checked August 2026",
  },

  {
    id: "umang",
    name: "UMANG",
    category: "Citizen Services",
    description:
      "Access a wide range of central and state government services through a unified government services platform.",
    eligibility:
      "Service eligibility depends on the individual government service being accessed.",
    documents:
      "Requirements vary according to the selected government service.",
    source: "web.umang.gov.in",
    officialUrl: "https://web.umang.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },

  {
    id: "cybercrime",
    name: "National Cyber Crime Reporting Portal",
    category: "Safety & Security",
    description:
      "Report cybercrime complaints online and access official information about cybercrime reporting.",
    eligibility:
      "Anyone needing to report a cybercrime can use the appropriate reporting facility.",
    documents:
      "Keep relevant incident details, evidence, and identification information ready when required.",
    source: "cybercrime.gov.in",
    officialUrl: "https://cybercrime.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },

  {
    id: "cpgrams",
    name: "CPGRAMS",
    category: "Public Grievance",
    description:
      "Register and track public grievances related to Government of India departments and organisations.",
    eligibility:
      "Citizens can submit grievances concerning eligible government departments and organisations.",
    documents:
      "Supporting information or documents may be required depending on the grievance.",
    source: "pgportal.gov.in",
    officialUrl: "https://pgportal.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },

  {
    id: "jeevan-pramaan",
    name: "Jeevan Pramaan",
    category: "Pension",
    description:
      "Generate and manage Digital Life Certificates for eligible pensioners through the Government's Jeevan Pramaan service.",
    eligibility:
      "The service is intended for eligible pensioners whose pension authority accepts Digital Life Certificates.",
    documents:
      "Pension and Aadhaar-related information may be required for authentication.",
    source: "jeevanpramaan.gov.in",
    officialUrl: "https://jeevanpramaan.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },

  {
    id: "enam",
    name: "e-NAM",
    category: "Agriculture",
    description:
      "Access the National Agriculture Market platform and information related to agricultural commodity trading.",
    eligibility:
      "Participation depends on the applicable e-NAM registration and market requirements.",
    documents:
      "Requirements vary depending on the participant and type of service.",
    source: "enam.gov.in",
    officialUrl: "https://www.enam.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },

  {
    id: "pm-awas-yojana",
    name: "PM Awas Yojana",
    category: "Housing",
    description:
      "Access official information and services related to Government housing programmes.",
    eligibility:
      "Eligibility depends on the applicable PMAY scheme and current government guidelines.",
    documents:
      "Documents depend on the applicable housing scheme and applicant category.",
    source: "pmaymis.gov.in",
    officialUrl: "https://pmaymis.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },

  {
    id: "national-government-services",
    name: "National Government Services Portal",
    category: "Citizen Services",
    description:
      "Find government services provided by central, state, and other government organisations through the National Government Services Portal.",
    eligibility:
      "Eligibility depends on the individual government service selected.",
    documents:
      "Requirements depend on the specific service and implementing authority.",
    source: "services.india.gov.in",
    officialUrl: "https://services.india.gov.in/",
    lastVerified: "Official portal link checked August 2026",
  },
  {
    id: "birth-certificate",
    name: "Birth Certificate",
    category: "Documents",
    description:
      "Apply for or verify a birth certificate through the relevant government registration authority.",
    eligibility:
      "Parents, guardians, or applicants who need an official birth record can check local registration authority procedures.",
    documents:
      "Requirements vary by state or local authority. Common details include the child's birth details, parent information, and identity proof.",
    source: "india.gov.in",
    officialUrl: "https://www.india.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "death-certificate",
    name: "Death Certificate",
    category: "Documents",
    description:
      "Access official guidance for applying for a death certificate and related registration services.",
    eligibility:
      "Family members or legal representatives can usually apply through the local registrar or municipal authority.",
    documents:
      "Document needs depend on the local authority and whether the certificate is being issued for legal, insurance, or family records.",
    source: "india.gov.in",
    officialUrl: "https://www.india.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "marriage-registration",
    name: "Marriage Registration",
    category: "Documents",
    description:
      "Check the process for registering a marriage and obtaining official marriage records.",
    eligibility:
      "Couples seeking legal registration can use the applicable state or local marriage registration process.",
    documents:
      "Requirements vary by state and may include marriage proof, identity documents, and witness information.",
    source: "india.gov.in",
    officialUrl: "https://www.india.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "caste-certificate",
    name: "Caste Certificate",
    category: "Documents",
    description:
      "Learn how to apply for a caste certificate for educational or welfare-related government support.",
    eligibility:
      "Applicants must meet the guidance of their state government and relevant eligibility criteria for caste-related certificates.",
    documents:
      "Identity proof, residence records, community documents, and supporting certificates may be requested depending on the state.",
    source: "india.gov.in",
    officialUrl: "https://www.india.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "income-certificate",
    name: "Income Certificate",
    category: "Documents",
    description:
      "Apply for an income certificate to support education, welfare, and other government benefit applications.",
    eligibility:
      "Residents can use the official certification route based on the institution or scheme requiring the certificate.",
    documents:
      "Requirements vary by state and scheme; income proof, residence proof, and identity documents are commonly needed.",
    source: "india.gov.in",
    officialUrl: "https://www.india.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "domicile-certificate",
    name: "Domicile Certificate",
    category: "Documents",
    description:
      "Find official guidance for obtaining a domicile certificate for state services and benefits.",
    eligibility:
      "Applicants generally need to demonstrate residence and eligibility under the relevant state rules.",
    documents:
      "Supporting documents can include residence proof, identity proof, and local registration records. Requirements vary by state.",
    source: "india.gov.in",
    officialUrl: "https://www.india.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "ews-certificate",
    name: "EWS Certificate",
    category: "Documents",
    description:
      "Access the general process for obtaining an Economically Weaker Section certificate for eligible benefits.",
    eligibility:
      "Eligibility depends on the current state or central scheme rules and income criteria.",
    documents:
      "Identity, residence, and income-related documents are commonly required and can vary by state.",
    source: "india.gov.in",
    officialUrl: "https://www.india.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "legal-heir-certificate",
    name: "Legal Heir Certificate",
    category: "Documents",
    description:
      "Learn how to apply for a legal heir certificate for succession, benefits, and property-related claims.",
    eligibility:
      "Eligible family members or legal representatives can apply according to the applicable local authority process.",
    documents:
      "Requirements vary by state and may include death records, family records, identity proof, and relationship documents.",
    source: "india.gov.in",
    officialUrl: "https://www.india.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "disability-udid",
    name: "Disability UDID Card",
    category: "Health",
    description:
      "Use the official disability certification process to apply for and manage a UDID card.",
    eligibility:
      "Persons with disabilities can check the current medical and verification guidelines for UDID issuance.",
    documents:
      "Medical certificate, identity proof, address proof, and disability assessment details may be required as per procedure.",
    source: "udid.gov.in",
    officialUrl: "https://www.udid.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "senior-citizen-services",
    name: "Senior Citizen Services",
    category: "Social security",
    description:
      "Explore pension, welfare, and support services for senior citizens through official government channels.",
    eligibility:
      "Eligibility depends on the specific benefit, age criteria, and applicable scheme rules.",
    documents:
      "Age proof, identity proof, residence proof, and scheme-specific documents may be required.",
    source: "india.gov.in",
    officialUrl: "https://www.india.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "abha-health-account",
    name: "ABHA Health Account",
    category: "Health",
    description:
      "Create and manage an Ayushman Bharat Health Account for digital health records and health services access.",
    eligibility:
      "Indian residents can create an ABHA account using the official digital health registration process.",
    documents:
      "Aadhaar, mobile number, and identity details are commonly used for registration. Requirements may vary by health service flow.",
    source: "abha.gov.in",
    officialUrl: "https://abha.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "esanjeevani",
    name: "eSanjeevani Telemedicine",
    category: "Health",
    description:
      "Access telemedicine consultation guidance and find government-run digital health consultation services.",
    eligibility:
      "Eligible patients can use digital consultation services according to the applicable healthcare provider and programme.",
    documents:
      "A valid mobile number, identity details, and health information may be needed depending on the consultation process.",
    source: "esanjeevaniopd.in",
    officialUrl: "https://esanjeevaniopd.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "online-hospital-appointments",
    name: "Online Hospital Appointments",
    category: "Health",
    description:
      "Book hospital appointments, OPD visits, and consultation slots using official booking portals.",
    eligibility:
      "Patients may need to follow the specific hospital system, appointment rules, and verification requirements.",
    documents:
      "Identity proof, appointment details, and relevant health information may be required based on the hospital or department.",
    source: "nhm.gov.in",
    officialUrl: "https://nhm.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "blood-bank-search",
    name: "Blood Bank Search",
    category: "Health",
    description:
      "Find nearby blood banks and official information about blood donation and availability services.",
    eligibility:
      "Eligibility for donors is set by blood bank and health department rules.",
    documents:
      "A donor ID, health screening, and basic medical information may be required at the blood bank or donor centre.",
    source: "nhm.gov.in",
    officialUrl: "https://nhm.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "tb-patient-support",
    name: "TB Patient Support",
    category: "Health",
    description:
      "Access information and support services for tuberculosis treatment, follow-up, and public health guidance.",
    eligibility:
      "Patients and caregivers can use the programme information relevant to TB treatment and support services.",
    documents:
      "Medical records, treatment details, and identity information may be required by the treatment centre or programme.",
    source: "nhm.gov.in",
    officialUrl: "https://nhm.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "organ-donation",
    name: "Organ Donation Information",
    category: "Health",
    description:
      "Read official information about organ donation registration, consent, and related healthcare guidance.",
    eligibility:
      "Eligibility depends on the organ donation programme rules and medical suitability criteria.",
    documents:
      "Identity proof, medical information, and consent details may be required by the relevant authority or hospital.",
    source: "nhm.gov.in",
    officialUrl: "https://nhm.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "food-business-license",
    name: "Food Business Licensing",
    category: "Business",
    description:
      "Understand the process for obtaining food business licences and related regulatory approvals.",
    eligibility:
      "Food business operators must meet the licensing requirements set by the state food authority or department.",
    documents:
      "Business details, identity documents, premise details, and food safety compliance records may be needed.",
    source: "fssai.gov.in",
    officialUrl: "https://www.fssai.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "generic-medicine-services",
    name: "Generic Medicine Information",
    category: "Health",
    description:
      "Find information about government-approved generic medicines and public healthcare guidance.",
    eligibility:
      "Eligible patients and institutions can review the current guidance for affordable medicine access and availability.",
    documents:
      "Prescription details or institutional requirements may be needed depending on the medicine or programme.",
    source: "nhm.gov.in",
    officialUrl: "https://nhm.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "medical-practitioner-verification",
    name: "Medical Practitioner Verification",
    category: "Health",
    description:
      "Check official verification details for medical practitioners and registered healthcare professionals.",
    eligibility:
      "Verification is relevant to patients, employers, or institutions checking practitioner credentials.",
    documents:
      "Licence details, registration numbers, and identity or hospital records may be reviewed as required.",
    source: "nmc.org.in",
    officialUrl: "https://www.nmc.org.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "national-health-information",
    name: "National Health Information",
    category: "Health",
    description:
      "Explore official nationwide health information, programme notices, and public health guidance.",
    eligibility:
      "Public health information is generally available to residents and institutions seeking official guidance.",
    documents:
      "Documentation needs depend on the specific service, policy, or programme being accessed.",
    source: "nhm.gov.in",
    officialUrl: "https://nhm.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "swayam-courses",
    name: "SWAYAM Online Courses",
    category: "Education",
    description:
      "Access free online courses from Indian universities and institutions through the SWAYAM platform.",
    eligibility:
      "Students, learners, and professionals can use the platform according to course eligibility and enrolment rules.",
    documents:
      "Course registration generally requires email, mobile verification, and profile details. Requirements vary by course.",
    source: "swayam.gov.in",
    officialUrl: "https://swayam.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "diksha-learning",
    name: "DIKSHA Learning Platform",
    category: "Education",
    description:
      "Use DIKSHA for digital learning resources, school content, and student learning support.",
    eligibility:
      "Students, teachers, and educational institutions can use the platform according to its access rules.",
    documents:
      "Profile and class or school information may be needed depending on the resource or learning programme.",
    source: "diksha.gov.in",
    officialUrl: "https://diksha.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "epathshala-textbooks",
    name: "ePathshala Textbooks",
    category: "Education",
    description:
      "Access digital textbooks and educational content through the ePathshala platform.",
    eligibility:
      "Students, teachers, and education stakeholders can access official digital learning resources according to platform access rules.",
    documents:
      "Document needs are usually minimal and depend on the educational institution or platform workflow.",
    source: "epathshala.nic.in",
    officialUrl: "https://epathshala.nic.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "national-digital-library",
    name: "National Digital Library",
    category: "Education",
    description:
      "Browse a large digital library of books, journals, and learning resources for students and researchers.",
    eligibility:
      "The platform is generally accessible to learners, students, and institutions meeting institutional or registration requirements.",
    documents:
      "A valid email, user profile, and institutional or academic details may be requested depending on access workflow.",
    source: "ndl.iitkgp.ac.in",
    officialUrl: "https://ndl.iitkgp.ac.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "academic-bank-credits",
    name: "Academic Bank of Credits",
    category: "Education",
    description:
      "Manage academic credits and learning records through the Academic Bank of Credits framework.",
    eligibility:
      "Students and institutions can use the system according to the applicable university and credit transfer rules.",
    documents:
      "Academic records, enrolment details, and institutional verification may be needed.",
    source: "abc.gov.in",
    officialUrl: "https://abc.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "apaar-student-id",
    name: "APAAR Student ID",
    category: "Education",
    description:
      "Create or manage the APAAR student identification system for lifelong academic tracking.",
    eligibility:
      "Students can access the system under the current education department and school registration process.",
    documents:
      "Student and parent details, school information, and identity records may be required for registration.",
    source: "apaar.education.gov.in",
    officialUrl: "https://apaar.education.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "ugc-student-resources",
    name: "UGC Student Resources",
    category: "Education",
    description:
      "Access UGC guidance, student resources, and academic support information for higher education learners.",
    eligibility:
      "Eligibility depends on the relevant student resource, scheme, or institution guidelines.",
    documents:
      "Academic and identity information may be requested depending on the specific resource or service.",
    source: "ugc.gov.in",
    officialUrl: "https://www.ugc.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "jee-main",
    name: "JEE Main",
    category: "Education",
    description:
      "Find information and registration guidance for the Joint Entrance Examination Main.",
    eligibility:
      "Candidates must satisfy the exam eligibility conditions published by the conducting authority.",
    documents:
      "Identity proof, academic details, and application-related documents are required according to the exam notice.",
    source: "jeemain.nta.nic.in",
    officialUrl: "https://jeemain.nta.nic.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "neet-ug",
    name: "NEET UG",
    category: "Education",
    description:
      "Access advisory and application information for the National Eligibility cum Entrance Test undergraduate exam.",
    eligibility:
      "Applicants must meet the current NEET UG eligibility conditions and academic standards.",
    documents:
      "Academic, identity, and application information can be required in the official registration process.",
    source: "neet.nta.nic.in",
    officialUrl: "https://neet.nta.nic.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "cuet-exams",
    name: "CUET Exams",
    category: "Education",
    description:
      "Check the Common University Entrance Test schedules, guidelines, and application details.",
    eligibility:
      "Candidates should review the official CUET eligibility rules and university requirements before applying.",
    documents:
      "Academic records, identity proof, and application details are usually required as per the latest notification.",
    source: "cuet.nta.nic.in",
    officialUrl: "https://cuet.nta.nic.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "national-career-service",
    name: "National Career Service",
    category: "Employment",
    description:
      "Find career guidance, job listings, and employment support through the National Career Service portal.",
    eligibility:
      "Job seekers and employers can use the portal under the applicable service and registration rules.",
    documents:
      "Profile information, resume data, and identity or qualification documents may be required.",
    source: "ncs.gov.in",
    officialUrl: "https://ncs.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "apprenticeship-registration",
    name: "Apprenticeship Registration",
    category: "Employment",
    description:
      "Register for apprenticeship opportunities and access official training placement guidance.",
    eligibility:
      "Applicants should review age, education, and skill criteria for the relevant apprenticeship programme.",
    documents:
      "Education records, identity proof, and profile information may be required for enrolment.",
    source: "apprenticeshipindia.gov.in",
    officialUrl: "https://apprenticeshipindia.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "skill-india-digital",
    name: "Skill India Digital Hub",
    category: "Jobs & skills",
    description:
      "Access skilling programmes, training resources, certifications, and government-backed job readiness information.",
    eligibility:
      "Learners and workers should check the course-specific eligibility criteria and registration process.",
    documents:
      "Identity proof, education credentials, and profile details may be required depending on the scheme.",
    source: "skillindia.gov.in",
    officialUrl: "https://skillindia.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "pm-shram-yogi-maandhan",
    name: "PM Shram Yogi Maandhan",
    category: "Pension",
    description:
      "Check benefits and registration information related to the pension scheme for unorganised workers.",
    eligibility:
      "Eligible workers can review the current age, income, and contribution criteria for the scheme.",
    documents:
      "Identity, age, and Aadhaar-linked information may be required for registration and verification.",
    source: "eshram.gov.in",
    officialUrl: "https://eshram.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "national-pension-system",
    name: "National Pension System",
    category: "Pension",
    description:
      "Access official information and services related to the National Pension System and retirement savings.",
    eligibility:
      "Eligibility depends on the annuity or pension account type and applicable rules.",
    documents:
      "KYC details, identity proof, and account information may be required by the pension service provider.",
    source: "npscra.nsdl.co.in",
    officialUrl: "https://www.npscra.nsdl.co.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "atal-pension-yojana",
    name: "Atal Pension Yojana",
    category: "Pension",
    description:
      "Find guidance for Atal Pension Yojana registration, benefits, and account-related information.",
    eligibility:
      "Workers and citizens meeting the age and eligibility conditions can check the scheme details on the official portal.",
    documents:
      "Aadhaar, bank account details, and identity proof are commonly required.",
    source: "pensionfund.gov.in",
    officialUrl: "https://financialservices.gov.in/atal-pension-yojana-apy",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "pmjjby",
    name: "PM Jeevan Jyoti Bima Yojana",
    category: "Money & taxes",
    description:
      "Learn about insurance coverage, premium details, and registration information for the PM Jeevan Jyoti Bima Yojana.",
    eligibility:
      "The scheme is intended for eligible bank account holders as per the current government rules.",
    documents:
      "Bank account and identity information are usually required during enrolment and verification.",
    source: "financialservices.gov.in",
    officialUrl: "https://financialservices.gov.in/pmjjby",
    linkType: "information",
    lastVerified: "Official scheme information page checked November 2026",
  },
  {
    id: "pmsby",
    name: "PM Suraksha Bima Yojana",
    category: "Money & taxes",
    description:
      "Access official guidance for accident insurance coverage and enrolment under the PM Suraksha Bima Yojana.",
    eligibility:
      "Eligible account holders can review current scheme conditions on the official portal.",
    documents:
      "Identity proof, bank details, and account linkage information are typically required.",
    source: "financialservices.gov.in",
    officialUrl: "https://financialservices.gov.in/pmsby",
    linkType: "information",
    lastVerified: "Official scheme information page checked November 2026",
  },
  {
    id: "apprenticeship-resources",
    name: "National Apprenticeship Resources",
    category: "Employment",
    description:
      "Explore national apprenticeship resources, sector guidance, and training-related information.",
    eligibility:
      "Apprenticeship eligibility depends on the programme, training provider, and relevant labour guidelines.",
    documents:
      "Academic records, government ID, and profile details may be required by the training programme.",
    source: "apprenticeshipindia.gov.in",
    officialUrl: "https://apprenticeshipindia.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "overseas-employment-guidance",
    name: "Overseas Employment Guidance",
    category: "Employment",
    description:
      "Review official guidance for overseas employment, registration procedures, and safe migration-related resources.",
    eligibility:
      "Applicants should check the current rules for employment abroad and the compliance requirements of the relevant authority.",
    documents:
      "Passport, identity, qualification, and travel-related documents may be required depending on placement or visa rules.",
    source: "mea.gov.in",
    officialUrl: "https://mea.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "pm-fasal-bima",
    name: "PM Fasal Bima Yojana",
    category: "Agriculture",
    description:
      "Understand crop insurance coverage and official guidance for PM Fasal Bima Yojana benefits.",
    eligibility:
      "Eligible farmers and insured cultivators can review the scheme's current conditions and crop coverage rules.",
    documents:
      "Land records, crop details, identity proof, and bank information may be required for claim or coverage support.",
    source: "pmfby.gov.in",
    officialUrl: "https://pmfby.gov.in/",
    linkType: "information",
    lastVerified: "Official scheme website checked November 2026",
  },
  {
    id: "soil-health-card",
    name: "Soil Health Card",
    category: "Agriculture",
    description:
      "Access guidance for soil testing and the Soil Health Card scheme for better crop planning.",
    eligibility:
      "Farmers can check whether they are eligible under the current government soil testing and advisory scheme.",
    documents:
      "Land and farm details, identity proof, and field information may be requested for soil testing support.",
    source: "soilhealth.dac.gov.in",
    officialUrl: "https://soilhealth.dac.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "kisan-credit-card",
    name: "Kisan Credit Card Guidance",
    category: "Agriculture",
    description:
      "Learn how to access Kisan Credit Card guidance and crop finance support for farmers.",
    eligibility:
      "Eligible farmers can review current institutional and agricultural financing rules before applying.",
    documents:
      "Land records, identity, bank details, and farm information may be required depending on the lender.",
    source: "nabard.org",
    officialUrl: "https://www.nabard.org/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "national-horticulture-board",
    name: "National Horticulture Board",
    category: "Agriculture",
    description:
      "Explore horticulture schemes, programmes, and market support from the National Horticulture Board.",
    eligibility:
      "Farmers, growers, and entrepreneurs can check scheme criteria and programme eligibility before applying.",
    documents:
      "Identity proof, farm or business details, and scheme-specific records may be needed.",
    source: "nhb.gov.in",
    officialUrl: "https://nhb.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "pm-matsya-sampada",
    name: "PM Matsya Sampada Yojana",
    category: "Agriculture",
    description:
      "Learn about fisheries development support and scheme information under the PM Matsya Sampada Yojana.",
    eligibility:
      "Fishers, aquaculture entrepreneurs, and eligible stakeholders can review scheme criteria and support conditions.",
    documents:
      "Identity, fisher or enterprise documents, and project details may be required for scheme guidance.",
    source: "mofpf.gov.in",
    officialUrl: "https://www.mofpf.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "agricultural-market-prices",
    name: "Agricultural Market Prices",
    category: "Agriculture",
    description:
      "Check current market prices, mandi data, and agricultural commodity information through official channels.",
    eligibility:
      "Market information is generally accessible to farmers, traders, and interested stakeholders.",
    documents:
      "Typically no separate application documents are required for price information, though local registration may be needed for some portals.",
    source: "agmarknet.gov.in",
    officialUrl: "https://agmarknet.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "kisan-suvidha",
    name: "Kisan Suvidha",
    category: "Agriculture",
    description:
      "Access farmer guidance, service information, and relevant agricultural support resources through Kisan Suvidha.",
    eligibility:
      "Farmers and agriculture stakeholders can use the portal according to the relevant service and local scheme rules.",
    documents:
      "Land and farm identity details may be needed for certain services, while general information remains open access.",
    source: "kisansuvidha.gov.in",
    officialUrl: "https://kisansuvidha.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "agriculture-infrastructure-fund",
    name: "Agriculture Infrastructure Fund",
    category: "Agriculture",
    description:
      "Review funding support and infrastructure development guidance for agriculture projects and value chains.",
    eligibility:
      "Entities and farmers seeking agricultural infrastructure support should review scheme eligibility and project requirements.",
    documents:
      "Project details, business or farm records, and financial information may be required.",
    source: "aif.gov.in",
    officialUrl: "https://aif.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "pm-kusum",
    name: "PM-KUSUM Solar Scheme",
    category: "Agriculture",
    description:
      "Find information on PM-KUSUM solar support, irrigation connections, and renewable energy opportunities for farmers.",
    eligibility:
      "Farmers and eligible institutions should review current scheme conditions and state-level implementation guidance.",
    documents:
      "Land records, power connection details, and identity or project information may be requested.",
    source: "mnre.gov.in",
    officialUrl: "https://mnre.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "national-livestock-mission",
    name: "National Livestock Mission",
    category: "Agriculture",
    description:
      "Explore mission programmes and support services for livestock development, productivity, and animal husbandry.",
    eligibility:
      "Farmers, breeders, and institutions can check scheme-specific eligibility and operational criteria.",
    documents:
      "Farm, animal, and identity records may be required depending on the programme or subsidy application.",
    source: "dahd.nic.in",
    officialUrl: "https://dahd.nic.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "irctc-rail-booking",
    name: "IRCTC Rail Booking",
    category: "Travel",
    description:
      "Book train tickets and access official railway reservation and travel services through IRCTC.",
    eligibility:
      "Passengers can use the service according to railway booking rules and ticketing requirements.",
    documents:
      "Passenger identity details, booking information, and valid travel documents may be needed for ticketing and travel compliance.",
    source: "irctc.co.in",
    officialUrl: "https://www.irctc.co.in/nget/train-search",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "national-train-enquiry",
    name: "National Train Enquiry",
    category: "Travel",
    description:
      "Check train status, schedules, and travel information through official railway enquiry services.",
    eligibility:
      "The service is generally available to any traveller seeking official timetable or status information.",
    documents:
      "No registration is usually required for status and schedule enquiries; travel documents are not generally needed.",
    source: "indianrailways.gov.in",
    officialUrl: "https://indianrailways.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "railway-parcel-services",
    name: "Railway Parcel Services",
    category: "Transport",
    description:
      "Learn how to send parcels or access railway parcel booking services through official railway channels.",
    eligibility:
      "Sender eligibility and parcel conditions are determined by Indian Railways rules and service availability.",
    documents:
      "Shipment details, sender and receiver information, and parcel booking requirements vary by service type.",
    source: "indianrailways.gov.in",
    officialUrl: "https://indianrailways.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "traffic-echallan",
    name: "e-Challan",
    category: "Transport",
    description:
      "Check traffic challan status, payment options, and related guidance through the official electronic challan system.",
    eligibility:
      "Vehicle owners and drivers can use the system according to the applicable traffic enforcement rules.",
    documents:
      "Vehicle registration, driving licence, and payment or case details may be required for status and payment services.",
    source: "echallan.parivahan.gov.in",
    officialUrl: "https://echallan.parivahan.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "fastag-services",
    name: "FASTag Information",
    category: "Transport",
    description:
      "Access official FASTag information, recharge guidance, and compliance details for toll payments.",
    eligibility:
      "Vehicle owners using national highways and toll facilities can use the service under the current FASTag rules.",
    documents:
      "Vehicle registration, KYC, and account or bank details may be required depending on the transaction or service.",
    source: "fastag.ihmcl.com",
    officialUrl: "https://fastag.ihmcl.com/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "indian-evisa",
    name: "Indian e-Visa",
    category: "Travel",
    description:
      "Apply for or check visa-related information through the official Indian e-Visa portal.",
    eligibility:
      "Eligibility depends on nationality, travel purpose, and current visa rules published by the Government of India.",
    documents:
      "Passport, travel itinerary, photograph, and supporting documents are typically required during application.",
    source: "indianvisaonline.gov.in",
    officialUrl: "https://indianvisaonline.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "oci-services",
    name: "OCI Services",
    category: "Travel",
    description:
      "Check Overseas Citizen of India services, registration, and updates through the official portal.",
    eligibility:
      "Eligible individuals can review OCI service requirements and the current application process.",
    documents:
      "Passport, nationality, relationship, and identity documents may be required for OCI-related services.",
    source: "ociservices.gov.in",
    officialUrl: "https://ociservices.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "bureau-of-immigration",
    name: "Bureau of Immigration",
    category: "Travel",
    description:
      "Access official immigration information, reporting requirements, and foreigner services guidance.",
    eligibility:
      "The service is relevant to foreign nationals, travellers, and applicants under current immigration rules.",
    documents:
      "Passport, visa, residence, and travel-related documents may be required depending on the request.",
    source: "boi.gov.in",
    officialUrl: "https://boi.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "customs-passenger-guidance",
    name: "Customs Passenger Guidance",
    category: "Travel",
    description:
      "Review customs guidance and passenger information for international travel and baggage rules.",
    eligibility:
      "Travelers can use official customs guidance according to their itinerary and baggage or declaration requirements.",
    documents:
      "Travel documents, baggage declaration details, and identity information may be required at the time of travel or inspection.",
    source: "cbic.gov.in",
    officialUrl: "https://www.cbic.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "civil-aviation-guidance",
    name: "Civil Aviation Guidance",
    category: "Travel",
    description:
      "Find official guidance on civil aviation services, passenger rules, and air travel information.",
    eligibility:
      "Passengers and aviation stakeholders can access the guidance relevant to their travel or operational context.",
    documents:
      "Travel and identity information may be required depending on the service or regulatory process.",
    source: "dgca.gov.in",
    officialUrl: "https://dgca.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "ecourts-services",
    name: "eCourts Services",
    category: "Governance",
    description:
      "Access digital court services, case information, and the official eCourts platform for litigation support.",
    eligibility:
      "Litigants and legal users can access services according to the court system and digital filing rules.",
    documents:
      "Case details, identity documents, and court filing information may be required depending on the matter.",
    source: "ecourts.gov.in",
    officialUrl: "https://ecourts.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "supreme-court-efiling",
    name: "Supreme Court e-Filing",
    category: "Governance",
    description:
      "Learn about the Supreme Court electronic filing system and digital case submission process.",
    eligibility:
      "Legal practitioners and parties accessing the system must meet the official filing criteria and court procedures.",
    documents:
      "Case papers, legal identity, and court-related documents may be required for e-filing.",
    source: "supremecourtofindia.nic.in",
    officialUrl: "https://main.sci.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "free-legal-aid",
    name: "Free Legal Aid",
    category: "Governance",
    description:
      "Explore legal aid opportunities and official information for people who need assistance with legal matters.",
    eligibility:
      "Eligible individuals may access legal support according to the applicable legal aid guidelines and income thresholds.",
    documents:
      "Identity proof, case information, and income or eligibility documents may be required for assistance.",
    source: "nalsa.gov.in",
    officialUrl: "https://nalsa.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "rti-online",
    name: "RTI Online",
    category: "Governance",
    description:
      "File a Right to Information request and track official responses through the RTI portal.",
    eligibility:
      "Indian citizens can use the RTI online system according to the applicable legal and procedural rules.",
    documents:
      "Identity and request details are usually required for filing, and supporting information may be needed based on the query.",
    source: "rtionline.gov.in",
    officialUrl: "https://rtionline.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "national-consumer-helpline",
    name: "National Consumer Helpline",
    category: "Grievances",
    description:
      "Raise consumer complaints and access guidance through the National Consumer Helpline.",
    eligibility:
      "Consumers can use the helpline according to their complaint and the rules of the relevant issue area.",
    documents:
      "Complaint details, purchase information, and supporting records may be helpful for resolution.",
    source: "consumerhelpline.gov.in",
    officialUrl: "https://consumerhelpline.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "consumer-dispute-filing",
    name: "Consumer Dispute Filing",
    category: "Grievances",
    description:
      "Understand how to file a consumer dispute or complaint through official consumer grievance routes.",
    eligibility:
      "Consumers can raise disputes based on the product, service, or issue covered by the relevant authority.",
    documents:
      "Purchase records, communication history, and identity details may be needed for dispute filing.",
    source: "consumerhelpline.gov.in",
    officialUrl: "https://consumerhelpline.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "ncw-complaints",
    name: "National Commission for Women Complaints",
    category: "Grievances",
    description:
      "Access complaint guidance and information through the National Commission for Women.",
    eligibility:
      "Women seeking redress or support can review the complaint process and relevant assistance measures.",
    documents:
      "Complaint details, identity proof, and evidence or witness information may be required depending on the case.",
    source: "ncw.nic.in",
    officialUrl: "https://ncw.nic.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "child-rights-complaints",
    name: "Child Rights Complaints",
    category: "Grievances",
    description:
      "Learn how to report child rights violations and access official redress mechanisms.",
    eligibility:
      "Complaints can be raised by guardians, caregivers, or concerned persons according to the applicable child-protection system.",
    documents:
      "Identity proof, case details, and supporting evidence may be required when filing a complaint.",
    source: "childlineindia.org",
    officialUrl: "https://childlineindia.org/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "legal-services-authorities",
    name: "Legal Services Authorities",
    category: "Governance",
    description:
      "Find legal services authorities and official legal aid support across the country.",
    eligibility:
      "Eligible individuals and groups can access legal services according to the current legal aid framework.",
    documents:
      "Identity proof, residence details, and case information may be requested for legal support services.",
    source: "nalsa.gov.in",
    officialUrl: "https://nalsa.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "police-clearance-guidance",
    name: "Police Clearance Guidance",
    category: "Safety & Security",
    description:
      "Check police clearance certificate information and official guidance for background checks and citizen requests.",
    eligibility:
      "Applicants must follow the rules of the state or police authority issuing the certificate.",
    documents:
      "Identity, address, and purpose-of-request details are often required for certificate issuance.",
    source: "police.gov.in",
    officialUrl: "https://www.police.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "mca-company-services",
    name: "MCA Company Services",
    category: "Business",
    description:
      "Access company registration and related Ministry of Corporate Affairs services through the official portal.",
    eligibility:
      "Businesses and promoters can use the service according to the current MCA registration and compliance rules.",
    documents:
      "Business details, identity proof, incorporation data, and company compliance records may be required.",
    source: "mca.gov.in",
    officialUrl: "https://www.mca.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "import-export-code",
    name: "Import Export Code",
    category: "Business",
    description:
      "Access guidance and application information for obtaining an Import Export Code for trade operations.",
    eligibility:
      "Businesses and exporters must meet the applicable registration and compliance requirements before using the code.",
    documents:
      "Business registration, identity, GST or tax information, and company details may be required.",
    source: "dgft.gov.in",
    officialUrl: "https://dgft.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "national-single-window",
    name: "National Single Window System",
    category: "Business",
    description:
      "Use the single-window platform to understand approvals, permits, and startup or business support services.",
    eligibility:
      "Businesses, investors, and entrepreneurs can use the portal according to the relevant approvals and scheme rules.",
    documents:
      "Business and project details may be needed depending on the approvals or services being requested.",
    source: "nsws.gov.in",
    officialUrl: "https://nsws.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "msme-samadhaan",
    name: "MSME Samadhaan",
    category: "Business",
    description:
      "Access grievance and dispute resolution guidance for MSME-related complaints and concerns.",
    eligibility:
      "MSME entrepreneurs and stakeholders can use the mechanism according to the relevant complaint and case criteria.",
    documents:
      "Business details, complaint information, and supporting records may be needed for resolution.",
    source: "samadhaan.msme.gov.in",
    officialUrl: "https://samadhaan.msme.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "msme-sambandh",
    name: "MSME Sambandh",
    category: "Business",
    description:
      "Review MSME performance, programme, and reporting information through the official Sambandh platform.",
    eligibility:
      "Registered entities and institutions relevant to MSME programmes can use the service according to current rules.",
    documents:
      "Registration and enterprise details may be required depending on the service or reporting feature.",
    source: "msme.gov.in",
    officialUrl: "https://msme.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "government-eprocurement",
    name: "Government e-Procurement",
    category: "Business",
    description:
      "Find government procurement opportunities, vendor registration information, and e-procurement guidance.",
    eligibility:
      "Suppliers and buyers can access services according to procurement and registration rules.",
    documents:
      "Business registration, tax documents, and vendor verification details may be required.",
    source: "eprocure.gov.in",
    officialUrl: "https://eprocure.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "pfms",
    name: "Public Financial Management System",
    category: "Money & taxes",
    description:
      "Access public financial management information and payment-related administrative services for government programmes.",
    eligibility:
      "Users must follow the relevant programme or department rules and access conditions.",
    documents:
      "Programme and account details may be required depending on the specific payment or ledger service.",
    source: "pfms.nic.in",
    officialUrl: "https://pfms.nic.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "customs-icegate",
    name: "Customs ICEGATE",
    category: "Business",
    description:
      "Use official customs digital services for import and export clearances through ICEGATE.",
    eligibility:
      "Importers, exporters, and customs users can use the platform according to trade and declaration rules.",
    documents:
      "Customs documents, shipping records, and identity or registration details may be required.",
    source: "icegate.gov.in",
    officialUrl: "https://www.icegate.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "trademark-registration",
    name: "Trademark Registration",
    category: "Business",
    description:
      "Access guidance and the trademark filing process through the official intellectual property portal.",
    eligibility:
      "Applicants should meet the trademark rules and filing conditions set by the competent authority.",
    documents:
      "Applicant details, business records, mark details, and supporting forms may be required.",
    source: "ipindia.gov.in",
    officialUrl: "https://ipindia.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "patent-filing",
    name: "Patent Filing",
    category: "Business",
    description:
      "Learn how to file a patent application and access official intellectual property services.",
    eligibility:
      "Applicants must align with the current patent filing and legal requirements set by the authority.",
    documents:
      "Inventor, applicant, and technical details, plus forms and proof of invention, may be required.",
    source: "ipindia.gov.in",
    officialUrl: "https://ipindia.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "pm-surya-ghar",
    name: "PM Surya Ghar",
    category: "Housing & utilities",
    description:
      "Access rooftop solar scheme information and consumer guidance for PM Surya Ghar installations.",
    eligibility:
      "Eligible households can review current programme conditions and state implementation guidance before applying.",
    documents:
      "Household details, identity proof, residence proof, and power connection information may be needed.",
    source: "pmsuryaghar.gov.in",
    officialUrl: "https://pmsuryaghar.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "ujala-led-programme",
    name: "UJALA LED Programme",
    category: "Housing & utilities",
    description:
      "Learn about LED distribution and energy efficiency support under the UJALA programme.",
    eligibility:
      "Households and electricity consumers can review eligibility under programme and utility implementation rules.",
    documents:
      "Identity, residence, and electricity connection details may be needed for programme participation.",
    source: "ujala.gov.in",
    officialUrl: "https://www.ujala.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "energy-efficiency-resources",
    name: "Energy Efficiency Resources",
    category: "Housing & utilities",
    description:
      "Explore official energy-saving guidance and programme information for households and public facilities.",
    eligibility:
      "Eligibility depends on the relevant programme, utility, or public sector efficiency initiative.",
    documents:
      "Consumer and property information may be requested based on the programme or facility type.",
    source: "beeindia.gov.in",
    officialUrl: "https://beeindia.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "environmental-clearances",
    name: "Environmental Clearances",
    category: "Government services",
    description:
      "Find official environmental clearance information and procedures for development or project approval.",
    eligibility:
      "Applicants must meet the environmental and legal conditions defined by the competent authority.",
    documents:
      "Project, site, technical, and environmental details are often required based on the approval category.",
    source: "moef.gov.in",
    officialUrl: "https://moef.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "pollution-control-information",
    name: "Pollution Control Information",
    category: "Government services",
    description:
      "Access official information on pollution control, emissions rules, and environmental compliance guidance.",
    eligibility:
      "Relevant users may include industrial operators, local bodies, and citizens depending on the issue or rule.",
    documents:
      "Operational, site, and compliance records may be needed depending on the regulatory query.",
    source: "cpcb.nic.in",
    officialUrl: "https://cpcb.nic.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "government-accommodation",
    name: "Government Accommodation",
    category: "Housing & utilities",
    description:
      "Review availability and application information for government accommodation and official housing support.",
    eligibility:
      "Eligibility depends on service category, office posting, or the rules of the relevant housing authority.",
    documents:
      "Identity, posting, and official service details may be required for accommodation requests.",
    source: "india.gov.in",
    officialUrl: "https://www.india.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "lpg-consumer-services",
    name: "LPG Consumer Services",
    category: "Housing & utilities",
    description:
      "Access LPG consumer service information for refills, connections, and household gas support.",
    eligibility:
      "Eligible households can review LPG rules and service steps through the official distributor or portal.",
    documents:
      "Identity proof, address proof, and KYC information may be needed for new connections or updates.",
    source: "mylpg.in",
    officialUrl: "https://mylpg.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "power-sector-information",
    name: "Power Sector Information",
    category: "Housing & utilities",
    description:
      "Find official information on the power sector, electricity services, and consumer guidance.",
    eligibility:
      "Consumers, utilities, and stakeholders can use the guidance according to the relevant service or local regulations.",
    documents:
      "Consumer and account details may be required depending on the specific power service.",
    source: "powermin.gov.in",
    officialUrl: "https://powermin.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "renewable-energy-programmes",
    name: "Renewable Energy Programmes",
    category: "Housing & utilities",
    description:
      "Explore renewable energy programme guidance and support under national energy and sustainability initiatives.",
    eligibility:
      "Applicants and institutions should review current scheme rules and implementation conditions before applying.",
    documents:
      "Project, site, and identity details may be required depending on the programme or application route.",
    source: "mnre.gov.in",
    officialUrl: "https://mnre.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "housing-urban-affairs",
    name: "Housing and Urban Affairs",
    category: "Housing & utilities",
    description:
      "Access official guidance and services related to urban housing, city planning, and government housing support.",
    eligibility:
      "Eligibility depends on the relevant programme, city authority, or beneficiary category.",
    documents:
      "Residence, identity, and project or household information may be required depending on the service.",
    source: "mohua.gov.in",
    officialUrl: "https://mohua.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "pm-ujjwala-yojana",
    name: "PM Ujjwala Yojana",
    category: "Welfare",
    description:
      "Review official information and support for clean cooking fuel access under PM Ujjwala Yojana.",
    eligibility:
      "Eligible households can check the current programme criteria and state implementation guidance.",
    documents:
      "Identity, household, and address details are commonly needed for scheme support and verification.",
    source: "pmujjwalayojana.gov.in",
    officialUrl: "https://pmujjwalayojana.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "national-food-security",
    name: "National Food Security",
    category: "Welfare",
    description:
      "Access information and guidance for food security benefits, ration services, and public welfare programmes.",
    eligibility:
      "Eligibility depends on the applicable food security scheme and household status.",
    documents:
      "Identity, residence, and household details may be required for ration or welfare-related services.",
    source: "nfsa.gov.in",
    officialUrl: "https://nfsa.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "one-nation-one-ration-card",
    name: "One Nation One Ration Card",
    category: "Welfare",
    description:
      "Check ration portability and food support benefits across states through the One Nation One Ration Card system.",
    eligibility:
      "Eligible households can use the programme according to the applicable state and ration card rules.",
    documents:
      "Ration card, identity, and residence details are generally required for portability and verification.",
    source: "nfsa.gov.in",
    officialUrl: "https://nfsa.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "pm-jan-dhan",
    name: "PM Jan Dhan Yojana",
    category: "Money & taxes",
    description:
      "Access information on zero-balance bank account access and government financial inclusion guidance.",
    eligibility:
      "Eligible citizens can review the scheme conditions published by the banking and government authorities.",
    documents:
      "Identity proof, Aadhaar, and bank linkage documents are typically required for account opening.",
    source: "pmjdy.gov.in",
    officialUrl: "https://pmjdy.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "pm-svanidhi",
    name: "PM SVANidhi",
    category: "Welfare",
    description:
      "Access the PM SVANidhi scheme for street vendor support, micro-credit, and urban informal economy assistance.",
    eligibility:
      "Street vendors and micro-entrepreneurs can review the applicable scheme criteria and local implementation rules.",
    documents:
      "Vendor identity, local residency, and business or vending details may be required for programme support.",
    source: "svanidhi.mohua.gov.in",
    officialUrl: "https://svanidhi.mohua.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "pm-vishwakarma",
    name: "PM Vishwakarma",
    category: "Welfare",
    description:
      "Review government support for artisans and traditional workers under the PM Vishwakarma programme.",
    eligibility:
      "Eligible craftsmen, artisans, and workers can check the current scheme criteria and application steps.",
    documents:
      "Identity, trade, and work-related proof may be required during registration or verification.",
    source: "pmvishwakarma.gov.in",
    officialUrl: "https://pmvishwakarma.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "national-overseas-scholarship",
    name: "National Overseas Scholarship",
    category: "Education",
    description:
      "Check scholarship information and support for eligible students seeking overseas higher education.",
    eligibility:
      "The scheme applies to eligible students who meet the published academic and income conditions.",
    documents:
      "Academic records, income proof, and identity documents may be required by the scholarship authority.",
    source: "scholarships.gov.in",
    officialUrl: "https://scholarships.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "e-anudaan-grants",
    name: "e-Anudaan Grants",
    category: "Welfare",
    description:
      "Find information on grant and sponsorship opportunities provided through the e-Anudaan initiative.",
    eligibility:
      "Applicants should review the specific grant category, eligibility rules, and application steps before applying.",
    documents:
      "Identity, organisational, and project or proposal details may be required depending on the grant.",
    source: "anudaan.gov.in",
    officialUrl: "https://anudaan.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "mgnrega-services",
    name: "MGNREGA Services",
    category: "Welfare",
    description:
      "Access official Mahatma Gandhi National Rural Employment Guarantee Act services and work-related guidance.",
    eligibility:
      "Rural households and workers meeting the current eligibility framework can use the service.",
    documents:
      "Identity, job card, and work or household details may be needed depending on the service requested.",
    source: "nrega.nic.in",
    officialUrl: "https://nrega.nic.in/",
    lastVerified: "Official government source recorded for reference",
  },
  {
    id: "startup-india-seed-fund",
    name: "Startup India Seed Fund",
    category: "Business",
    description:
      "Check seed funding information and support guidance for startup entrepreneurs under government-backed programmes.",
    eligibility:
      "Startups should review the current programme conditions and stage-specific eligibility rules before applying.",
    documents:
      "Business plan, incorporation records, identity proof, and startup details may be required.",
    source: "startupindia.gov.in",
    officialUrl: "https://www.startupindia.gov.in/",
    lastVerified: "Official government source recorded for reference",
  },
  ...educationServices,
  ...transportServices,
];
export function getServiceById(id: string) {
  return services.find((item) => item.id === id);
}
export function searchServices(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return services;
  return services.filter((item) =>
    [item.name, item.category, item.description, item.source]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}
